import { useEdition } from '@/features/edition';
import { NewspaperStage } from '@/features/newspaper';
import { EditionSplash } from '@/features/newspaper/components/EditionSplash/EditionSplash.tsx';

export function App() {
  const state = useEdition();

  if (state.status === 'loading') {
    return <EditionSplash mode="loading" />;
  }

  if (state.status === 'missing') {
    return <EditionSplash mode="missing" />;
  }

  return (
    <NewspaperStage
      edition={state.edition}
      availableEditions={state.availableEditions}
      onSelectEdition={state.selectDate}
    />
  );
}
