import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";

export type LayoutContextType = {
  setPageTitle?: (title: string) => void;
  pageTitle?: string;
  isNavFolded?: boolean; setIsNavFolded?: (isNavFolded: boolean) => void;
};

export const defaultValue: LayoutContextType = {
};

export const LayoutContext =
  createContext<LayoutContextType>(defaultValue);

export const useLayoutContext = () => useContext(LayoutContext);

export interface ILayoutContextProviderProps {
  value?: LayoutContextType;
}
export const LayoutContextProvider: FC<PropsWithChildren & ILayoutContextProviderProps> = ({
  children, value
}) => {
  const [pageTitle, setPageTitle] = useState<string>();
  const [isNavFolded, setIsNavFolded] = useState<boolean>();

  return (
    <LayoutContext.Provider
      value={{ setPageTitle, pageTitle, isNavFolded, setIsNavFolded, ...(value || {}) }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
