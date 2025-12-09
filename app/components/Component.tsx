import type { FC } from 'react';

const Component: FC = () => {
  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">
          This component is unused. Navigate to <code>/</code>, <code>/login</code>, or{' '}
          <code>/signup/company</code>.
        </p>
      </div>
    </main>
  );
};

export default Component;