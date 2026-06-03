<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\BillingItem;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = Billing::with('patient');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('billing_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('billing_date', '<=', $request->date_to);
        }

        $billings = $query->latest()->paginate(10);

        return Inertia::render('Billings/Index', [
            'billings' => $billings,
        ]);
    }

    public function create()
    {
        return Inertia::render('Billings/Create', [
            'patients' => Patient::select('patient_id', 'name')->get(),
            'services' => Service::where('status', 'active')->select('id', 'name', 'price')->get(),
            'medicines' => Medicine::where('is_active', '1')->select('id', 'name', 'selling_price')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,patient_id',
            'billing_date' => 'required|date',
            'due_date' => 'nullable|date',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:service,medicine',
            'items.*.id' => 'required',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad(Billing::count() + 1, 4, '0', STR_PAD_LEFT);
            $subtotal = 0;

            $billing = Billing::create([
                'patient_id' => $validated['patient_id'],
                'invoice_number' => $invoiceNumber,
                'billing_date' => $validated['billing_date'],
                'due_date' => $validated['due_date'] ?? null,
                'subtotal' => 0,
                'tax' => $validated['tax'] ?? 0,
                'discount' => $validated['discount'] ?? 0,
                'total' => 0,
                'amount_paid' => 0,
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $item) {
                if ($item['type'] === 'service') {
                    $itemable = Service::find($item['id']);
                    $unitPrice = $itemable->price;
                    $description = $itemable->name;
                } else {
                    $itemable = Medicine::find($item['id']);
                    $unitPrice = $itemable->selling_price;
                    $description = $itemable->name;
                }

                $total = $unitPrice * $item['quantity'];
                $subtotal += $total;

                BillingItem::create([
                    'billing_id' => $billing->id,
                    'service_id' => $item['type'] === 'service' ? $item['id'] : null,
                    'medicine_id' => $item['type'] === 'medicine' ? $item['id'] : null,
                    'description' => $description,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total' => $total,
                ]);
            }

            $total = $subtotal + ($validated['tax'] ?? 0) - ($validated['discount'] ?? 0);
            $billing->update(['subtotal' => $subtotal, 'total' => $total]);
        });

        return redirect()->route('billings.index')
            ->with('success', 'Billing created successfully.');
    }

    public function show(Billing $billing)
    {
        $billing->load(['patient', 'items.service', 'items.medicine', 'createdBy']);

        return Inertia::render('Billings/Show', [
            'billing' => $billing,
        ]);
    }

    public function edit(Billing $billing)
    {
        if ($billing->status === 'paid') {
            return redirect()->route('billings.index')
                ->with('error', 'Cannot edit a paid billing.');
        }

        $billing->load('items');

        return Inertia::render('Billings/Edit', [
            'billing' => $billing,
            'patients' => Patient::select('patient_id', 'name')->get(),
            'services' => Service::where('status', 'active')->select('id', 'name', 'price')->get(),
            'medicines' => Medicine::where('is_active', '1')->select('id', 'name', 'selling_price')->get(),
        ]);
    }

    public function update(Request $request, Billing $billing)
    {
        if ($billing->status === 'paid') {
            return redirect()->route('billings.index')
                ->with('error', 'Cannot update a paid billing.');
        }

        $validated = $request->validate([
            'billing_date' => 'required|date',
            'due_date' => 'nullable|date',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.type' => 'required|in:service,medicine',
            'items.*.id' => 'required',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($billing, $validated, $request) {
            $billing->update([
                'billing_date' => $validated['billing_date'],
                'due_date' => $validated['due_date'] ?? null,
                'tax' => $validated['tax'] ?? $billing->tax,
                'discount' => $validated['discount'] ?? $billing->discount,
                'notes' => $validated['notes'] ?? null,
            ]);

            if (isset($validated['items'])) {
                $billing->items()->delete();
                $subtotal = 0;
                foreach ($validated['items'] as $item) {
                    if ($item['type'] === 'service') {
                        $itemable = Service::find($item['id']);
                        $unitPrice = $itemable->price;
                        $description = $itemable->name;
                    } else {
                        $itemable = Medicine::find($item['id']);
                        $unitPrice = $itemable->selling_price;
                        $description = $itemable->name;
                    }

                    $total = $unitPrice * $item['quantity'];
                    $subtotal += $total;

                    BillingItem::create([
                        'billing_id' => $billing->id,
                        'service_id' => $item['type'] === 'service' ? $item['id'] : null,
                        'medicine_id' => $item['type'] === 'medicine' ? $item['id'] : null,
                        'description' => $description,
                        'quantity' => $item['quantity'],
                        'unit_price' => $unitPrice,
                        'total' => $total,
                    ]);
                }
                $total = $subtotal + ($validated['tax'] ?? 0) - ($validated['discount'] ?? 0);
                $billing->update(['subtotal' => $subtotal, 'total' => $total]);
            }
        });

        return redirect()->route('billings.index')
            ->with('success', 'Billing updated successfully.');
    }

    public function destroy(Billing $billing)
    {
        if ($billing->status === 'paid') {
            return redirect()->route('billings.index')
                ->with('error', 'Cannot delete a paid billing.');
        }

        $billing->items()->delete();
        $billing->delete();

        return redirect()->route('billings.index')
            ->with('success', 'Billing deleted successfully.');
    }

    public function payment(Request $request, Billing $billing)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0|max:' . ($billing->total - $billing->amount_paid),
            'payment_method' => 'required|in:cash,card,bank_transfer,insurance',
        ]);

        $newAmountPaid = $billing->amount_paid + $validated['amount'];
        $status = $newAmountPaid >= $billing->total ? 'paid' : 'partial';

        $billing->update([
            'amount_paid' => $newAmountPaid,
            'status' => $status,
            'payment_method' => $validated['payment_method'],
            'payment_date' => now(),
        ]);

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }
}
