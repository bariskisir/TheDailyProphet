import type { Edition } from '@/shared/types/edition.ts';
import type { PageModel } from '@/features/edition';
import { BackPage } from '../BackPage/BackPage.tsx';
import { FrontPage } from '../FrontPage/FrontPage.tsx';
import { InnerPage } from '../InnerPage/InnerPage.tsx';
import type { ContentsEntry, PageContext } from '../../types.ts';

interface NewspaperPageProps {
  edition: Edition;
  page: PageModel;
  contents: ContentsEntry[];
  context: PageContext;
  onSelectPage?: (pageNumber: number) => void;
}

export function NewspaperPage({ edition, page, contents, context, onSelectPage }: NewspaperPageProps) {
  switch (page.kind) {
    case 'front':
      return <FrontPage edition={edition} model={page} contents={contents} context={context} onSelectPage={onSelectPage} />;
    case 'inner':
      return <InnerPage edition={edition} model={page} context={context} />;
    case 'back':
      return <BackPage edition={edition} model={page} context={context} />;
  }
}
