import React, { useState } from 'react';
import { Book, ChevronDown, ChevronUp, ExternalLink, FileText, Scale, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils';

interface Reference {
  id: string;
  title: string;
  section: string;
  link: string;
  context: string;
  category: 'technical' | 'legal' | 'standards' | 'guidelines';
}

export default function ReferenceList() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const references: Reference[] = [
    {
      id: '1',
      title: t('technicalSpecification'),
      section: 'Chapter 3.2.1',
      link: '#tech-spec-3.2.1',
      context: t('technicalSpecContext'),
      category: 'technical'
    },
    {
      id: '2',
      title: t('contractClause'),
      section: 'Clause 15.4',
      link: '#contract-15.4',
      context: t('contractClauseContext'),
      category: 'legal'
    },
    {
      id: '3',
      title: t('constructionStandard'),
      section: 'Section 2.3',
      link: '#standard-2.3',
      context: t('constructionStandardContext'),
      category: 'standards'
    },
    {
      id: '4',
      title: t('qualityGuidelines'),
      section: 'Page 45',
      link: '#guidelines-45',
      context: t('qualityGuidelinesContext'),
      category: 'guidelines'
    }
  ];

  const categories = [
    { id: 'technical', icon: Wrench, label: t('technical') },
    { id: 'legal', icon: Scale, label: t('legal') },
    { id: 'standards', icon: FileText, label: t('standards') },
    { id: 'guidelines', icon: Book, label: t('guidelines') }
  ];

  const filteredReferences = selectedCategory
    ? references.filter(ref => ref.category === selectedCategory)
    : references;

  return (
    <div className="bg-white rounded-lg shadow mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2">
          <Book className="w-5 h-5 text-blue-600" />
          <span className="font-medium">{t('references')}</span>
          <span className="text-sm text-gray-500">({references.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 border-t">
          {/* Category Filter */}
          <div className="flex space-x-2 mb-4">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm",
                    selectedCategory === category.id
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* References List */}
          <div className="space-y-3">
            {filteredReferences.map(reference => (
              <div
                key={reference.id}
                className="p-3 rounded-lg border hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{reference.title}</h4>
                    <p className="text-sm text-gray-600">{reference.section}</p>
                  </div>
                  <a
                    href={reference.link}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle document display/popup here
                      console.log(`Opening document: ${reference.link}`);
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">{t('view')}</span>
                  </a>
                </div>
                <p className="text-sm text-gray-600 mt-2">{reference.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}