import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Clock, Heart, MessageCircle, Users } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Badge from "../common/Badge";
import Button from "../common/Button";

dayjs.extend(relativeTime);

function IdeaCard({ idea }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary-500">
        <Badge color="primary">{idea.categoryLabel}</Badge>
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {dayjs(idea.createdAt).fromNow()}
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-900">{idea.title}</h3>
        <p className="text-sm text-slate-600">{idea.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {idea.skillsNeeded?.map((skill) => (
          <Badge key={skill} color="neutral">
            {skill}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4 text-rose-500" />
            {idea.upvoteCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-sky-500" />
            {idea.commentCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4 text-emerald-500" />
            {idea.interestedCount} interested
          </span>
        </div>
        <Button variant="secondary" as={Link} to={`/ideas/${idea.id}`}>
          View Idea
        </Button>
      </div>
    </article>
  );
}

IdeaCard.propTypes = {
  idea: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    categoryLabel: PropTypes.string.isRequired,
    skillsNeeded: PropTypes.arrayOf(PropTypes.string),
    upvoteCount: PropTypes.number.isRequired,
    commentCount: PropTypes.number.isRequired,
    interestedCount: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default IdeaCard;
