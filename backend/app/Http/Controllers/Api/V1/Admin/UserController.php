<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Support\QueryHelpers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::query()->with('roles.permissions');
        QueryHelpers::search($query, $request->query('search'), ['name', 'email']);

        if (filled($request->query('role'))) {
            $query->role((string) $request->query('role'));
        }

        QueryHelpers::sort($query, $request->query('sort'), ['id', 'name', 'email', 'created_at'], '-id');

        return UserResource::collection($query->paginate(QueryHelpers::perPage($request))->withQueryString());
    }

    public function show(string $id): UserResource
    {
        return new UserResource(User::query()->with('roles.permissions')->findOrFail($id));
    }

    public function store(UserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data) {
            $user = User::query()->create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
            $user->syncRoles($data['roles']);

            return $user;
        });

        return (new UserResource($user->load('roles.permissions')))->response()->setStatusCode(201);
    }

    public function update(UserRequest $request, string $id): UserResource
    {
        $user = User::query()->findOrFail($id);
        $data = $request->validated();

        if (isset($data['roles'])) {
            Gate::forUser($request->user())->authorize('changeRoles', [$user, $data['roles']]);
        }

        DB::transaction(function () use ($user, $data) {
            $user->fill(array_filter(
                ['name' => $data['name'] ?? null, 'email' => $data['email'] ?? null, 'password' => $data['password'] ?? null],
                fn ($value) => $value !== null,
            ))->save();

            if (isset($data['roles'])) {
                $user->syncRoles($data['roles']);
            }
        });

        return new UserResource($user->refresh()->load('roles.permissions'));
    }

    public function destroy(Request $request, string $id): Response
    {
        $user = User::query()->findOrFail($id);
        Gate::forUser($request->user())->authorize('delete', $user);

        $user->delete();

        return response()->noContent();
    }

    public function roles(): JsonResponse
    {
        $roles = Role::query()->with('permissions')->orderBy('id')->get()->map(fn (Role $role) => [
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name')->sort()->values()->all(),
        ]);

        return response()->json(['data' => $roles]);
    }
}
