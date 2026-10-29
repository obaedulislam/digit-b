import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PasswordInput, TextInput } from '@mantine/core';
import { formatDate } from '@/lib/format';
import { rolesApi, usersApi } from '../../api/resources';
import { adminKeys } from '../../api/keys';
import { useAuth } from '../../auth/AuthContext';
import { ResourceForm } from '../../components/ResourceForm';
import { ResourceTable, RowTitle } from '../../components/ResourceTable';
import { FormSection } from '../../components/fields/Inputs';
import { FormSelect } from '../../components/fields/FormFields';
import { humanize } from '../../lib/helpers';
import { roleLabel } from '../../lib/permissions';
import { passwordProblem, required } from '../../lib/validators';

const useRoles = () => useQuery({ queryKey: adminKeys.roles, queryFn: rolesApi.list, staleTime: 5 * 60_000 });

export function UsersList() {
  const roles = useRoles();
  const { user: me } = useAuth();

  const columns = [
    {
      id: 'name',
      header: 'User',
      primary: true,
      sortKey: 'name',
      cell: (row) => (
        <RowTitle to={`/admin/users/${row.id}`} sub={row.email}>
          {row.name}
          {row.id === me?.id && <span className="admin-you"> (you)</span>}
        </RowTitle>
      ),
    },
    {
      id: 'roles',
      header: 'Role',
      cell: (row) => (
        <ul className="admin-chips">
          {row.roles.map((role) => (
            <li key={role} className="admin-chips__item">
              {roleLabel(role)}
            </li>
          ))}
        </ul>
      ),
    },
    { id: 'created_at', header: 'Added', sortKey: 'created_at', hideBelow: 'md', cell: (row) => formatDate(row.created_at) },
  ];

  return (
    <ResourceTable
      resource={usersApi}
      title="Users & roles"
      eyebrow="System"
      description="Who can sign in to this admin, and what they can do."
      columns={columns}
      filters={[{ name: 'role', label: 'Role', allLabel: 'All roles', options: (roles.data ?? []).map((role) => ({ value: role.name, label: roleLabel(role.name) })) }]}
      searchPlaceholder="Search name or email"
      defaultSort="name"
      entity="user"
      itemName={(row) => row.name}
      createTo="/admin/users/new"
      createLabel="New user"
      editTo={(row) => `/admin/users/${row.id}`}
      deleteMessage={(row) => (row ? `${row.name} will lose access immediately. You cannot delete yourself or the last super admin.` : '')}
    />
  );
}

const DEFAULTS = { name: '', email: '', password: '', role: '' };
const fromRecord = (user) => ({ name: user.name ?? '', email: user.email ?? '', password: '', role: user.roles?.[0] ?? '' });

const toPayload = (values) => {
  const payload = { name: values.name.trim(), email: values.email.trim().toLowerCase(), roles: [values.role] };
  if (values.password) payload.password = values.password;
  return payload;
};

function validateFor(isEdit) {
  return {
    name: required('a name', 255),
    email: (value) => (/^\S+@\S+\.\S+$/.test(value.trim()) ? null : 'Enter a valid email address.'),
    role: (value) => (value ? null : 'Choose a role.'),
    password: (value) => {
      if (!value) return isEdit ? null : 'Set a password for the new user.';
      return passwordProblem(value);
    },
  };
}

function UserFields({ form, isEdit, record }) {
  const roles = useRoles();
  const { user: me } = useAuth();
  const selected = (roles.data ?? []).find((role) => role.name === form.values.role);
  const editingSelf = isEdit && record?.id === me?.id;

  return (
    <>
      <FormSection title="Account">
        <div className="admin-fields">
          <TextInput label="Full name" withAsterisk maxLength={255} autoComplete="off" {...form.getInputProps('name')} />
          <TextInput label="Email" type="email" withAsterisk maxLength={255} autoComplete="off" {...form.getInputProps('email')} />
          <PasswordInput
            label={isEdit ? 'New password' : 'Password'}
            withAsterisk={!isEdit}
            autoComplete="new-password"
            description={isEdit ? 'Leave empty to keep the current password.' : 'At least 10 characters with upper case, lower case and a number.'}
            visibilityToggleButtonProps={{ 'aria-label': 'Show or hide password' }}
            {...form.getInputProps('password')}
          />
        </div>
      </FormSection>
      <FormSection title="Role" description={editingSelf ? 'You are editing your own account. You cannot remove your own super admin role.' : undefined}>
        <div className="admin-fields">
          <FormSelect
            form={form}
            name="role"
            label="Role"
            required
            placeholder="Choose a role"
            options={(roles.data ?? []).map((role) => ({ value: role.name, label: roleLabel(role.name) }))}
          />
          {selected && (
            <div className="admin-permissions">
              <p className="admin-permissions__title">{roleLabel(selected.name)} can</p>
              <ul className="admin-chips">
                {selected.permissions.map((permission) => (
                  <li key={permission} className="admin-chips__item">
                    {humanize(permission)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </FormSection>
    </>
  );
}

export function UserForm() {
  const { id } = useParams();
  return (
    <ResourceForm
      id={id}
      resource={usersApi}
      entity="user"
      listLabel="Users & roles"
      listPath="/admin/users"
      title="New user"
      recordTitle={(user) => user.name}
      defaults={DEFAULTS}
      fromRecord={fromRecord}
      toPayload={toPayload}
      validate={validateFor(id !== undefined)}
      Fields={UserFields}
    />
  );
}
