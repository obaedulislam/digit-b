<?php

namespace App\Actions;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\ApplicationEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateApplication
{
    /**
     * Updates status and/or notes and records an audit event for each change.
     *
     * @param  array{status?: string, notes?: string|null}  $data
     */
    public function handle(Application $application, array $data, User $actor): Application
    {
        return DB::transaction(function () use ($application, $data, $actor) {
            if (isset($data['status']) && $data['status'] !== $application->status->value) {
                $from = $application->status;
                $to = ApplicationStatus::from($data['status']);
                $application->status = $to;

                ApplicationEvent::query()->create([
                    'application_id' => $application->id,
                    'user_id' => $actor->id,
                    'type' => ApplicationEvent::TYPE_STATUS_CHANGED,
                    'from_status' => $from->value,
                    'to_status' => $to->value,
                ]);
            }

            if (array_key_exists('notes', $data) && $data['notes'] !== $application->notes) {
                $application->notes = $data['notes'];

                ApplicationEvent::query()->create([
                    'application_id' => $application->id,
                    'user_id' => $actor->id,
                    'type' => ApplicationEvent::TYPE_NOTE_UPDATED,
                    'note' => $data['notes'],
                ]);
            }

            $application->save();

            return $application->refresh();
        });
    }
}
