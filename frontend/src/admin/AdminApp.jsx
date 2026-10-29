import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import '@/styles/admin.scss';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/AuthContext';
import { RequireAuth, RequirePermission } from './auth/guards';
import { AdminLayout } from './layout/AdminLayout';
import { NAV_ITEMS } from './layout/nav';
import { PERMISSIONS as P, firstAllowedPath } from './lib/permissions';
import { Forbidden } from './pages/Forbidden';
import LoginPage from './pages/Login';

// Each feature is its own chunk; the shell and the login page stay in the main admin chunk.
const named = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Applications = lazy(() => import('./pages/Applications'));
const ApplicationDetail = lazy(() => import('./pages/Applications/Detail'));
const Jobs = named(() => import('./pages/Jobs'), 'JobsList');
const JobForm = named(() => import('./pages/Jobs'), 'JobForm');
const Inquiries = lazy(() => import('./pages/Inquiries'));
const MentorshipRequests = lazy(() => import('./pages/MentorshipRequests'));
const Subscribers = lazy(() => import('./pages/Subscribers'));
const Posts = named(() => import('./pages/Posts'), 'PostsList');
const PostForm = named(() => import('./pages/Posts'), 'PostForm');
const Categories = named(() => import('./pages/Categories'), 'CategoriesList');
const CategoryForm = named(() => import('./pages/Categories'), 'CategoryForm');
const Services = named(() => import('./pages/Services'), 'ServicesList');
const ServiceForm = named(() => import('./pages/Services'), 'ServiceForm');
const Testimonials = named(() => import('./pages/Testimonials'), 'TestimonialsList');
const TestimonialForm = named(() => import('./pages/Testimonials'), 'TestimonialForm');
const Faqs = named(() => import('./pages/Faqs'), 'FaqsList');
const FaqForm = named(() => import('./pages/Faqs'), 'FaqForm');
const Programs = named(() => import('./pages/MentorshipPrograms'), 'ProgramsList');
const ProgramForm = named(() => import('./pages/MentorshipPrograms'), 'ProgramForm');
const Settings = lazy(() => import('./pages/Settings'));
const Users = named(() => import('./pages/Users'), 'UsersList');
const UserForm = named(() => import('./pages/Users'), 'UserForm');
const NotFound = lazy(() => import('./pages/NotFound'));

const guard = (permission, element) => <RequirePermission permission={permission}>{element}</RequirePermission>;

/** `/admin` lands on the first section the signed-in role may open. */
function AdminHome() {
  const { user } = useAuth();
  const target = firstAllowedPath(user, NAV_ITEMS);
  return target ? <Navigate to={target} replace /> : <Forbidden />;
}

/** list / new / :id triple for a CRUD resource. */
function crud(path, permission, List, Form) {
  return [
    <Route key={path} path={path} element={guard(permission, <List />)} />,
    <Route key={`${path}/new`} path={`${path}/new`} element={guard(permission, <Form />)} />,
    <Route key={`${path}/:id`} path={`${path}/:id`} element={guard(permission, <Form />)} />,
  ];
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={guard(P.dashboard, <Dashboard />)} />

          <Route path="applications" element={guard(P.applications, <Applications />)} />
          <Route path="applications/:id" element={guard(P.applications, <ApplicationDetail />)} />

          {crud('jobs', P.jobs, Jobs, JobForm)}

          <Route path="inquiries" element={guard(P.inquiries, <Inquiries />)} />
          <Route path="mentorship-requests" element={guard(P.inquiries, <MentorshipRequests />)} />
          <Route path="subscribers" element={guard(P.inquiries, <Subscribers />)} />

          {crud('posts', P.content, Posts, PostForm)}
          {crud('post-categories', P.content, Categories, CategoryForm)}
          {crud('services', P.content, Services, ServiceForm)}
          {crud('testimonials', P.content, Testimonials, TestimonialForm)}
          {crud('faqs', P.content, Faqs, FaqForm)}
          {crud('mentorship-programs', P.content, Programs, ProgramForm)}

          <Route path="settings" element={guard(P.settings, <Settings />)} />
          {crud('users', P.users, Users, UserForm)}

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
