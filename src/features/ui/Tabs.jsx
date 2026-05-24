import classNames from 'classnames';

export function Tabs({ tabs, activeTab, onTabChange, className }) {
    const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

    return (
        <div className={className}>
            <div className="flex flex-wrap gap-1 border-b border-slate-200" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={classNames(
                            '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                            activeTab === tab.id
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                        )}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-4" role="tabpanel">
                {active?.content}
            </div>
        </div>
    );
}
