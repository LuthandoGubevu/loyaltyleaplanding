import { ApiError, errorResponse, requireAdminBusiness } from '@/lib/firebase/admin';
import { loadLog, loadMembers } from '@/lib/loyalty/analytics';
import { getBusiness } from '@/lib/loyalty/server';

const isoDate = (t: number | null) => (t === null ? '' : new Date(t).toISOString());

function csv(rows: (string | number | null)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell === null ? '' : String(cell);
          // Quote everything that could break a cell, and stop spreadsheet
          // apps from treating user-entered names as formulas.
          const isPhone = /^\+\d+$/.test(value);
          const safe = !isPhone && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
          return `"${safe.replace(/"/g, '""')}"`;
        })
        .join(','),
    )
    .join('\r\n');
}

// CSV export of members or the stamp history (Pro plan).
export async function GET(req: Request) {
  try {
    const user = await requireAdminBusiness(req);
    const { plan } = await getBusiness(user.businessId);
    if (!plan.export) throw new ApiError(403, 'CSV export is included in the Pro plan.');

    const type = new URL(req.url).searchParams.get('type');
    let body: string;
    if (type === 'members') {
      const members = await loadMembers(user.businessId);
      body = csv([
        ['Name', 'Cellphone', 'Current stamps', 'Lifetime stamps', 'Joined', 'Last visit', 'Birthday (MM-DD)'],
        ...members.map((m) => [m.name, `+${m.phone}`, m.stamps, m.lifetimeStamps, isoDate(m.createdAt), isoDate(m.lastStampAt), m.birthday]),
      ]);
    } else if (type === 'stamps') {
      const log = await loadLog(user.businessId);
      body = csv([
        ['Date', 'Cellphone', 'Type', 'Method', 'Reward', 'Reward cost (R)', 'Birthday reward'],
        ...log.reverse().map((e) => [isoDate(e.at), `+${e.memberId}`, e.type, e.method, e.rewardName, e.costRand, e.birthday ? 'yes' : '']),
      ]);
    } else {
      throw new ApiError(400, 'Choose members or stamps.');
    }

    return new Response('﻿' + body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="loyalty-leap-${type}.csv"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
