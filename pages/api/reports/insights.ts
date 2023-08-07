import { canViewWebsite } from 'lib/auth';
import { useCors, useAuth } from 'lib/middleware';
import { NextApiRequestQueryBody } from 'lib/types';
import { NextApiResponse } from 'next';
import { ok, methodNotAllowed, unauthorized } from 'next-basics';
import { getInsights } from 'queries';

export interface InsightsRequestBody {
  websiteId: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  fields: { name: string; type: string; value: string }[];
  filters: string[];
  groups: { name: string; type: string }[];
}

export default async (
  req: NextApiRequestQueryBody<any, InsightsRequestBody>,
  res: NextApiResponse,
) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'POST') {
    const {
      websiteId,
      dateRange: { startDate, endDate },
      groups,
      filters,
    } = req.body;

    if (!(await canViewWebsite(req.auth, websiteId))) {
      return unauthorized(res);
    }

    const data = await getInsights(websiteId, groups, {
      ...filters,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
