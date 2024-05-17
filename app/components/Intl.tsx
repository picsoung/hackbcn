'use client';

import { createIntl } from '@formatjs/intl';
import { createContext, useContext } from 'react';
import i18nConfig from '../../i18n.json';

export const IntlContext = createContext(createIntl({ locale: i18nConfig.locale.source }));

export type IntlProviderProps = {
  locale: string;
  data: Record<string, string>;
  children: React.ReactNode;
};

export function IntlProvider(props: IntlProviderProps) {
  return (
    <IntlContext.Provider
      value={createIntl({ locale: props.locale, messages: props.data })}
    >
      {props.children}
    </IntlContext.Provider>
  );
}

export function useIntl() {
  return useContext(IntlContext);
}

export function IntlMessage({ id }: any) {
  const intl = useIntl();
  return intl.formatMessage({ id });
}