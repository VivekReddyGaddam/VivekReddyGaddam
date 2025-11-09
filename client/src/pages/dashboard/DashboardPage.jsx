import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BarChart3, Bookmark, MessageSquare } from "lucide-react";

import Button from "../../components/common/Button";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import useAuthStore from "../../stores/useAuthStore";
import apiClient from "../../lib/apiClient";

const defaultDashboardData = {
  stats: {
    ideasPosted: 0,
    interestedThisMonth: 0,
    activeConversations: 0,
  },
  ideas: [],
  conversations: [],
  collections: [],
};

function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const { data = defaultDashboardData, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await apiClient.get("/users/me/dashboard");
      return response.data;
    },
    enabled: isAuthenticated,
    retry: 1,
  });

  if (!isAuthenticated) {
    return (
      <section className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Create an account to unlock your dashboard</h1>
        <p className="max-w-lg text-base text-slate-600">
          Track your ideas, manage interested collaborators, and monitor traction once you’re signed in.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/auth/register" variant="primary">
            Create account
          </Button>
          <Button as={Link} to="/auth/login" variant="secondary">
            Log in
          </Button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <LoadingOverlay message="Loading your IdeaConnect activity..." />;
  }

  if (isError) {
    return (
      <section className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-600">
        <h2 className="text-lg font-semibold">We’re having trouble loading your dashboard.</h2>
        <p className="text-sm">Please refresh the page or check back shortly.</p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-base text-slate-600">Monitor performance, manage ideas, and respond to collaborators.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Ideas Posted</span>
          <p className="mt-2 text-3xl font-bold text-slate-900">{data?.stats?.ideasPosted ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Interested this month</span>
          <p className="mt-2 text-3xl font-bold text-slate-900">{data?.stats?.interestedThisMonth ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Conversations</span>
          <p className="mt-2 text-3xl font-bold text-slate-900">{data?.stats?.activeConversations ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your Ideas</h2>
            <Button as={Link} to="/post" variant="secondary" icon={BarChart3} iconPosition="right">
              Post new idea
            </Button>
          </div>
          {data?.ideas?.length ? (
            <ul className="space-y-4">
              {data.ideas.map((idea) => (
                <li key={idea.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{idea.title}</h3>
                      <p className="text-xs text-slate-500">
                        {idea.upvote_count} upvotes • {idea.interested_count} interested • {idea.comment_count} comments
                      </p>
                    </div>
                    <Button as={Link} to={`/ideas/${idea.id}`} variant="ghost">
                      View
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Post your first idea to start tracking performance.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Inbox snapshot</h2>
            <Button as={Link} to="/messages" variant="secondary" icon={MessageSquare} iconPosition="right">
              Open inbox
            </Button>
          </div>
          {data?.conversations?.length ? (
            <ul className="space-y-4">
              {data.conversations.map((conversation) => (
                <li key={conversation.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{conversation.partner_name}</p>
                      <p className="text-xs text-slate-500">{conversation.last_message_preview}</p>
                    </div>
                    <span className="text-xs text-slate-400">{conversation.updated_at_relative}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              When collaborators click “I’m Interested” you’ll see the conversation appear here.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Collections</h2>
            <p className="text-sm text-slate-500">Keep track of ideas you’ve bookmarked for inspiration.</p>
          </div>
          <Button as={Link} to="/ideas" variant="secondary" icon={Bookmark} iconPosition="right">
            Explore feed
          </Button>
        </div>
        {data?.collections?.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.collections.map((collection) => (
              <li key={collection.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{collection.name}</h3>
                <p className="text-xs text-slate-500">{collection.count} ideas saved</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Save ideas from the feed to build your inspiration lists.
          </p>
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
