import { Outlet } from 'react-router-dom';

// Generic Placeholder Component
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground">
      This page ({title}) is not yet implemented.
    </p>
    {/* Outlet allows nested routes to render here if needed */}
    <Outlet /> 
  </div>
);

// Specific placeholders (could add more detail later)
export const CalendarPage = () => <PlaceholderPage title="Calendar" />;
export const TasksPage = () => <PlaceholderPage title="Tasks" />;
export const TasksStatusPage = ({ status }: { status: string }) => <PlaceholderPage title={`Tasks - ${status}`} />;
export const ToolsPage = () => <PlaceholderPage title="Tools" />;
export const NotificationPage = () => <PlaceholderPage title="Notifications" />;
export const InboxPage = () => <PlaceholderPage title="Inbox" />;
export const IntegrationPage = () => <PlaceholderPage title="Integrations" />;
export const ReportingPage = () => <PlaceholderPage title="Reporting" />;
export const MetricsPage = () => <PlaceholderPage title="Metrics" />;
export const ActiveMetricsPage = () => <PlaceholderPage title="Active Metrics" />;
export const PastMetricsPage = () => <PlaceholderPage title="Past Metrics" />;
export const HelpPage = () => <PlaceholderPage title="Help Center" />;
export const SettingsPage = () => <PlaceholderPage title="Settings" />;
export const InvitePage = () => <PlaceholderPage title="Invite Teams" />; 