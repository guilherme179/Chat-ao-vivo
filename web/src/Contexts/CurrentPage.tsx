import React, { createContext, useState } from 'react';

interface CurrentPageContextData {
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}

const CurrentPageContext = createContext<CurrentPageContextData>({} as CurrentPageContextData);

export const CurrentPageProvider: React.FC = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('/chat');

  return (
    <CurrentPageContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </CurrentPageContext.Provider>
  );
};

export default CurrentPageContext;