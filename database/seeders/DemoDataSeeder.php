<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\CarModel;
use App\Models\DeviceToken;
use App\Models\Favorite;
use App\Models\IdentityDocument;
use App\Models\Inquiry;
use App\Models\Notification;
use App\Models\Package;
use App\Models\Payment;
use App\Models\PaymentWebhookEvent;
use App\Models\Report;
use App\Models\SellerApplication;
use App\Models\SellerProfile;
use App\Models\Showroom;
use App\Models\ShowroomApplication;
use App\Models\ShowroomDocument;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

class DemoDataSeeder extends Seeder
{
    /**
     * 1x1 PNG used for demo uploads.
     */
    protected const DEMO_PIXEL_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    /**
     * Run the database seeds (local development only).
     */
    public function run(): void
    {
        if (! app()->isLocal()) {
            $this->command->warn('DemoDataSeeder skipped (not a local environment).');

            return;
        }

        $buyerRole = Role::firstOrCreate(
            ['name' => 'buyer', 'guard_name' => 'web'],
            ['name' => 'buyer', 'guard_name' => 'web']
        );
        $sellerRole = Role::firstOrCreate(
            ['name' => 'individual_seller', 'guard_name' => 'web'],
            ['name' => 'individual_seller', 'guard_name' => 'web']
        );

        // 5 buyers.
        $buyers = collect(range(1, 5))->map(fn ($i) => $this->makeUser("Demo Buyer {$i}", "buyer{$i}@demo.local", $buyerRole));

        // 3 approved individual sellers.
        $sellers = collect(range(1, 3))->map(function ($i) use ($sellerRole) {
            $user = $this->makeUser("Demo Seller {$i}", "seller{$i}@demo.local", $sellerRole);
            SellerProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'user_id' => $user->id,
                    'seller_type' => 'individual',
                    'display_name' => "Demo Seller {$i}",
                    'verification_status' => 'approved',
                    'approved_at' => now(),
                ]
            );

            return $user;
        });

        // 2 approved showrooms with active subscriptions.
        $package = Package::where('slug', 'business')->first()
            ?? Package::create([
                'name' => 'Business',
                'slug' => 'business',
                'price_amount' => 100000,
                'currency' => 'MMK',
                'duration_days' => 30,
                'active_listing_limit' => 20,
            ]);

        $showrooms = collect(range(1, 2))->map(function ($i) use ($package) {
            $owner = User::firstOrCreate(
                ['email' => "showroom{$i}@demo.local"],
                [
                    'name' => "Demo Showroom Owner {$i}",
                    'email' => "showroom{$i}@demo.local",
                    'password' => Hash::make('password'),
                    'account_status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            $showroom = Showroom::firstOrCreate(
                ['slug' => "demo-showroom-{$i}"],
                [
                    'owner_user_id' => $owner->id,
                    'business_name' => "Demo Showroom {$i}",
                    'slug' => "demo-showroom-{$i}",
                    'phone' => '0910000000'.$i,
                    'address' => 'Yangon',
                    'region' => 'Yangon',
                    'verification_status' => 'approved',
                    'approved_at' => now(),
                ]
            );

            if (! $showroom->users()->where('users.id', $owner->id)->exists()) {
                $showroom->users()->attach($owner->id, [
                    'member_role' => 'owner',
                    'is_active' => true,
                    'joined_at' => now(),
                ]);
            }

            $subscription = Subscription::firstOrCreate(
                ['showroom_id' => $showroom->id, 'package_id' => $package->id],
                [
                    'showroom_id' => $showroom->id,
                    'package_id' => $package->id,
                    'status' => 'active',
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($package->duration_days),
                    'active_listing_limit_snapshot' => $package->active_listing_limit,
                    'price_amount_snapshot' => $package->price_amount,
                    'currency_snapshot' => $package->currency,
                ]
            );

            Payment::firstOrCreate(
                ['subscription_id' => $subscription->id, 'payer_user_id' => $owner->id, 'provider' => 'demo'],
                [
                    'subscription_id' => $subscription->id,
                    'payer_user_id' => $owner->id,
                    'provider' => 'demo',
                    'amount' => $package->price_amount,
                    'currency' => $package->currency,
                    'status' => 'succeeded',
                    'paid_at' => now(),
                ]
            );

            return $showroom;
        });

        // 20 cars (mix of published / pending), alternating sellers and showrooms.
        // Fixed model ids keep the car order stable so re-runs keep the same favorites.
        $modelIds = [20, 14, 68, 36, 69, 28, 62, 49, 90, 45, 43, 70, 18, 63, 34, 15, 48, 83, 72, 65];
        $models = CarModel::with('make')->whereIn('id', $modelIds)->get()->keyBy('id');
        $models = collect($modelIds)->map(fn ($id) => $models[$id]);
        $statuses = ['published', 'published', 'published', 'pending_review'];
        $cars = $models->values()->map(function ($model, $index) use ($sellers, $showrooms, $statuses) {
            $fromShowroom = $index % 2 === 0;
            $showroom = $fromShowroom ? $showrooms[$index % 2] : null;
            $seller = $fromShowroom ? null : $sellers[$index % 3];

            return Car::firstOrCreate(
                ['title' => "Demo {$model->make->name} {$model->name} #{$index}"],
                [
                    'seller_user_id' => $seller?->id,
                    'showroom_id' => $showroom?->id,
                    'make_id' => $model->make_id,
                    'model_id' => $model->id,
                    'title' => "Demo {$model->make->name} {$model->name} #{$index}",
                    'year' => 2015 + ($index % 10),
                    'price_amount' => 10000000 + ($index * 2500000),
                    'currency' => 'MMK',
                    'mileage' => 10000 + ($index * 5000),
                    'transmission' => $index % 2 ? 'automatic' : 'manual',
                    'fuel_type' => $index % 3 ? 'petrol' : 'diesel',
                    'location' => $index % 2 ? 'Yangon' : 'Mandalay',
                    'condition' => 'used',
                    'status' => $statuses[$index % 4],
                    'published_at' => $statuses[$index % 4] === 'published' ? now() : null,
                ]
            );
        });

        // 2-3 images per car (tiny valid PNGs for local dev).
        Storage::disk('public')->makeDirectory('demo-cars');
        $pixel = base64_decode(self::DEMO_PIXEL_PNG);
        foreach ($cars as $car) {
            for ($i = 1; $i <= 2 + ($car->id % 2); $i++) {
                $key = "demo-cars/car-{$car->id}-{$i}.png";
                Storage::disk('public')->put($key, $pixel);
                CarImage::firstOrCreate(
                    ['car_id' => $car->id, 'storage_key' => $key],
                    [
                        'car_id' => $car->id,
                        'storage_key' => $key,
                        'alt_text' => "{$car->title} photo {$i}",
                        'sort_order' => $i,
                        'is_primary' => $i === 1,
                    ]
                );
            }
        }

        // 10 favorites across buyers and cars.
        $favoritePairs = [[4, 18], [8, 19], [9, 15], [2, 15], [9, 17]];
        $favCount = 0;
        foreach ($buyers as $index => $buyer) {
            foreach ($favoritePairs[$index] as $carIndex) {
                Favorite::firstOrCreate(['user_id' => $buyer->id, 'car_id' => $cars[$carIndex]->id]);
                $favCount++;
            }
        }

        // 15 inquiries from buyers, routed to the car's seller or showroom owner.
        for ($i = 0; $i < 15; $i++) {
            $car = $cars[$i % 20];
            $receiverId = $car->seller_user_id ?? $car->showroom?->owner_user_id;

            $inquiry = Inquiry::firstOrCreate(
                [
                    'sender_user_id' => $buyers[$i % 5]->id,
                    'car_id' => $car->id,
                    'message' => "Is demo car #{$i} still available?",
                ],
                [
                    'receiver_user_id' => $receiverId,
                    'contact_phone' => '0920000000'.$i,
                    'status' => 'new',
                ]
            );

            if (! $inquiry->receiver_user_id) {
                $inquiry->update(['receiver_user_id' => $receiverId]);
            }
        }

        // 5 open reports on cars.
        foreach ($cars->take(5) as $i => $car) {
            Report::firstOrCreate(
                ['reporter_user_id' => $buyers[$i % 5]->id, 'target_type' => 'car', 'target_id' => $car->id],
                [
                    'reporter_user_id' => $buyers[$i % 5]->id,
                    'target_type' => 'car',
                    'target_id' => $car->id,
                    'reason' => 'wrong_info',
                    'description' => 'Demo report.',
                    'status' => 'open',
                ]
            );
        }

        // Pending seller application with identity documents.
        $pendingUser = $this->makeUser('Demo Pending Applicant', 'applicant1@demo.local', $buyerRole);
        $application = SellerApplication::firstOrCreate(
            ['user_id' => $pendingUser->id],
            [
                'seller_type' => 'individual',
                'full_name' => 'Demo Pending Applicant',
                'phone' => '09500000001',
                'email' => 'applicant1@demo.local',
                'address' => 'Yangon',
                'accepted_terms' => true,
                'accepted_terms_at' => now(),
                'status' => 'pending_review',
                'submitted_at' => now(),
            ]
        );
        $this->seedIdentityDocument($application, 'nrc', 'nrc-demo.png');
        $this->seedIdentityDocument($application, 'passport', 'passport-demo.png');

        // Draft seller application (document uploaded, not submitted).
        $draftUser = $this->makeUser('Demo Draft Applicant', 'applicant2@demo.local', $buyerRole);
        $application = SellerApplication::firstOrCreate(
            ['user_id' => $draftUser->id],
            [
                'seller_type' => 'individual',
                'full_name' => 'Demo Draft Applicant',
                'phone' => '09500000002',
                'email' => 'applicant2@demo.local',
                'address' => 'Mandalay',
                'accepted_terms' => true,
                'accepted_terms_at' => now(),
                'status' => 'draft',
            ]
        );
        $this->seedIdentityDocument($application, 'nrc', 'nrc-draft-demo.png');

        // Pending showroom with a submitted application and documents.
        $pendingOwner = $this->makeUser('Demo Pending Showroom Owner', 'pending-showroom@demo.local', $buyerRole);
        $pendingShowroom = Showroom::firstOrCreate(
            ['slug' => 'demo-pending-showroom'],
            [
                'owner_user_id' => $pendingOwner->id,
                'business_name' => 'Demo Pending Showroom',
                'slug' => 'demo-pending-showroom',
                'registration_number' => 'DEMO-REG-0001',
                'phone' => '09100000003',
                'email' => 'pending-showroom@demo.local',
                'address' => 'Mandalay',
                'region' => 'Mandalay',
                'verification_status' => 'pending',
            ]
        );
        if (! $pendingShowroom->users()->where('users.id', $pendingOwner->id)->exists()) {
            $pendingShowroom->users()->attach($pendingOwner->id, [
                'member_role' => 'owner',
                'is_active' => true,
                'joined_at' => now(),
            ]);
        }
        $showroomApplication = ShowroomApplication::firstOrCreate(
            ['showroom_id' => $pendingShowroom->id],
            [
                'submitted_by' => $pendingOwner->id,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]
        );
        $this->seedShowroomDocument($showroomApplication, 'business_registration', 'business-registration-demo.png');
        $this->seedShowroomDocument($showroomApplication, 'representative_id', 'representative-id-demo.png');

        // Showroom manager (non-owner staff member).
        $managerRole = Role::firstOrCreate(
            ['name' => 'showroom_manager', 'guard_name' => 'web'],
            ['name' => 'showroom_manager', 'guard_name' => 'web']
        );
        $manager = $this->makeUser('Demo Showroom Manager', 'showroom1manager@demo.local', $managerRole);
        if (! $showrooms[0]->users()->where('users.id', $manager->id)->exists()) {
            $showrooms[0]->users()->attach($manager->id, [
                'member_role' => 'manager',
                'is_active' => true,
                'joined_at' => now(),
            ]);
        }

        // Sample notifications.
        Notification::firstOrCreate(
            ['user_id' => $buyers[0]->id, 'type' => 'welcome', 'title' => 'Welcome to Car Market'],
            [
                'body' => 'Browse listings, save favorites and contact sellers.',
                'read_at' => now(),
            ]
        );
        Notification::firstOrCreate(
            ['user_id' => $sellers[0]->id, 'type' => 'inquiry.new', 'title' => 'New buyer inquiry'],
            [
                'body' => 'A buyer is interested in one of your listings.',
                'data_json' => ['car_id' => $cars[1]->id],
            ]
        );
        Notification::firstOrCreate(
            ['user_id' => $sellers[0]->id, 'type' => 'listing.approved', 'title' => 'Your listing is live'],
            [
                'body' => 'Your car listing passed review and is now public.',
                'data_json' => ['car_id' => $cars[1]->id],
                'read_at' => now(),
            ]
        );
        Notification::firstOrCreate(
            ['user_id' => $showrooms[0]->owner_user_id, 'type' => 'payment.succeeded', 'title' => 'Payment confirmed'],
            [
                'body' => 'Your package payment was confirmed and the subscription activated.',
                'data_json' => ['showroom_id' => $showrooms[0]->id],
            ]
        );
        Notification::firstOrCreate(
            ['user_id' => $showrooms[0]->owner_user_id, 'type' => 'subscription.expiring', 'title' => 'Package expires soon'],
            [
                'body' => 'Your subscription expires in 7 days. Renew to keep your listings visible.',
                'data_json' => ['showroom_id' => $showrooms[0]->id],
            ]
        );
        Notification::firstOrCreate(
            ['user_id' => $pendingUser->id, 'type' => 'verification.pending', 'title' => 'Application under review'],
            ['body' => 'Your seller application was submitted and is under review.']
        );

        // Device tokens for push testing.
        DeviceToken::firstOrCreate(
            ['token' => 'demo-fcm-android-buyer1'],
            [
                'user_id' => $buyers[0]->id,
                'platform' => 'android',
                'last_used_at' => now(),
            ]
        );
        DeviceToken::firstOrCreate(
            ['token' => 'demo-apns-ios-seller1'],
            [
                'user_id' => $sellers[0]->id,
                'platform' => 'ios',
                'last_used_at' => now(),
            ]
        );

        // Admin audit trail entries.
        $superAdmin = User::where('email', 'softwareteam@gmail.com')->first();
        AuditLog::firstOrCreate(
            ['action' => 'car.approved', 'target_type' => $cars[0]->getMorphClass(), 'target_id' => $cars[0]->id],
            [
                'actor_user_id' => $superAdmin?->id,
                'metadata_json' => ['from' => 'pending_review', 'to' => 'published'],
                'ip_address' => '127.0.0.1',
            ]
        );
        AuditLog::firstOrCreate(
            ['action' => 'showroom.approved', 'target_type' => $showrooms[0]->getMorphClass(), 'target_id' => $showrooms[0]->id],
            [
                'actor_user_id' => $superAdmin?->id,
                'metadata_json' => ['from' => 'pending', 'to' => 'approved'],
                'ip_address' => '127.0.0.1',
            ]
        );
        $demoPayment = Payment::where('provider', 'demo')->first();
        if ($demoPayment) {
            AuditLog::firstOrCreate(
                ['action' => 'payment.status_changed', 'target_type' => $demoPayment->getMorphClass(), 'target_id' => $demoPayment->id],
                [
                    'actor_user_id' => null,
                    'metadata_json' => ['from' => 'pending', 'to' => 'succeeded'],
                    'ip_address' => '127.0.0.1',
                ]
            );
        }

        // Processed webhook events.
        PaymentWebhookEvent::firstOrCreate(
            ['provider' => 'demo', 'event_id' => 'evt_demo_0001'],
            [
                'event_type' => 'payment.succeeded',
                'payload_safe' => [
                    'event_id' => 'evt_demo_0001',
                    'event_type' => 'payment.succeeded',
                    'provider_reference' => 'demo-ref-0001',
                    'status' => 'succeeded',
                    'amount' => 100000,
                    'currency' => 'MMK',
                ],
                'received_at' => now()->subMinutes(10),
                'processed_at' => now()->subMinutes(9),
            ]
        );
        PaymentWebhookEvent::firstOrCreate(
            ['provider' => 'demo', 'event_id' => 'evt_demo_0002'],
            [
                'event_type' => 'payment.failed',
                'payload_safe' => [
                    'event_id' => 'evt_demo_0002',
                    'event_type' => 'payment.failed',
                    'provider_reference' => 'demo-ref-0002',
                    'status' => 'failed',
                    'amount' => 100000,
                    'currency' => 'MMK',
                ],
                'received_at' => now()->subMinutes(5),
                'processed_at' => now()->subMinutes(4),
            ]
        );

        $this->command->info("Demo data seeded ({$favCount} favorites).");
    }

    protected function makeUser(string $name, string $email, Role $role): User
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'account_status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        if (! $user->hasRole($role->name)) {
            $user->assignRole($role);
        }

        return $user;
    }

    protected function seedIdentityDocument(SellerApplication $application, string $type, string $filename): void
    {
        $pixel = base64_decode(self::DEMO_PIXEL_PNG);
        $key = "identity-documents/app-{$application->id}-{$filename}";
        Storage::disk('local')->put($key, $pixel);

        IdentityDocument::firstOrCreate(
            ['seller_application_id' => $application->id, 'storage_key' => $key],
            [
                'document_type' => $type,
                'original_filename' => $filename,
                'mime_type' => 'image/png',
                'file_size_bytes' => strlen($pixel),
                'document_status' => 'uploaded',
            ]
        );
    }

    protected function seedShowroomDocument(ShowroomApplication $application, string $type, string $filename): void
    {
        $pixel = base64_decode(self::DEMO_PIXEL_PNG);
        $key = "showroom-documents/app-{$application->id}-{$filename}";
        Storage::disk('local')->put($key, $pixel);

        ShowroomDocument::firstOrCreate(
            ['showroom_application_id' => $application->id, 'storage_key' => $key],
            [
                'document_type' => $type,
                'original_filename' => $filename,
                'mime_type' => 'image/png',
                'file_size_bytes' => strlen($pixel),
                'status' => 'uploaded',
            ]
        );
    }
}
