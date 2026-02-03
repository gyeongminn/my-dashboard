import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// DB IDs
export const DB_IDS = {
  tasks: '9c6d54236d9f4d45857d11671eee9eaf',
  routines: '8e92762840c246edb97fde85e1db6dde',
  weeklyReview: 'fd78e1d8-1f4c-42af-a4fa-f3c7ade76019',
  meetings: '80f27d8c-f773-486c-abab-ee83ac66df44',
};

// 작업함 조회
export async function getTasks(filter = {}) {
  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.tasks,
      filter: filter.filter,
      sorts: filter.sorts || [
        { property: '우선순위', direction: 'ascending' },
        { property: '마감일', direction: 'ascending' },
      ],
    });
    
    return response.results.map(page => parseTaskPage(page));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// 루틴 조회
export async function getRoutines() {
  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.routines,
      sorts: [{ property: '주기', direction: 'ascending' }],
    });
    
    return response.results.map(page => parseRoutinePage(page));
  } catch (error) {
    console.error('Error fetching routines:', error);
    return [];
  }
}


// 페이지 파싱 헬퍼
function parseTaskPage(page) {
  const props = page.properties;
  return {
    id: page.id,
    title: getTitle(props['작업명']),
    status: getSelect(props['상태']),
    area: getSelect(props['영역']),
    priority: getSelect(props['우선순위']),
    dueDate: getDate(props['마감일']),
    completedDate: getDate(props['완료일']),
    memo: getRichText(props['메모']),
    url: page.url,
    createdAt: page.created_time,
  };
}

function parseRoutinePage(page) {
  const props = page.properties;
  return {
    id: page.id,
    title: getTitle(props['루틴명']),
    frequency: getSelect(props['주기']),
    area: getSelect(props['영역']),
    completed: getCheckbox(props['완료']),
    memo: getRichText(props['메모']),
    url: page.url,
  };
}


// 프로퍼티 추출 헬퍼
function getTitle(prop) {
  return prop?.title?.[0]?.plain_text || '';
}

function getSelect(prop) {
  return prop?.select?.name || '';
}

function getRichText(prop) {
  return prop?.rich_text?.[0]?.plain_text || '';
}

function getDate(prop) {
  return prop?.date?.start || null;
}

function getCheckbox(prop) {
  return prop?.checkbox || false;
}

export default notion;
