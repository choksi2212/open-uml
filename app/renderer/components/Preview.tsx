import React from 'react';

interface PreviewProps {
  data: string | null;
  isRendering: boolean;
  format: 'svg' | 'png';
  theme: 'dark' | 'light';
}

const Preview: React.FC<PreviewProps> = ({ data, isRendering, format, theme }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className={`
        px-4 py-2 text-sm font-medium border-b
        ${theme === 'dark' ? 'bg-dark-surface border-dark-border text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'}
      `}>
        Preview
      </div>
      <div className={`
        flex-1 flex items-center justify-center overflow-auto p-4
        ${theme === 'dark' ? 'bg-dark-bg' : 'bg-white'}
      `}>
        {isRendering ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Rendering diagram...
            </p>
          </div>
        ) : data ? (
          format === 'svg' ? (
            <div 
              className="max-w-full max-h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ 
                __html: data.includes('data:image/svg+xml;base64,') 
                  ? atob(data.split(',')[1]) 
                  : data.includes('data:image/svg+xml,')
                  ? decodeURIComponent(data.split(',')[1])
                  : data
              }}
            />
          ) : (
            <img 
              src={data} 
              alt="Diagram preview" 
              className="max-w-full max-h-full object-contain"
            />
          )
        ) : (
          <div className={`
            text-center
            ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <p className="text-lg mb-2">No preview available</p>
            <p className="text-sm">Start typing PlantUML code to see the diagram</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;

