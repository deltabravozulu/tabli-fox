import * as React from 'react';

export interface Layout {
    tabPaddingTop: number;
    tabPaddingBottom: number;
    tabMarginTop: number;
    tabMarginBottom: number;
    windowHeaderHeight: string;
    sectionPaddingTop: number;
    sectionPaddingBottom: number;
    sectionHeaderFontSize: string;
    sectionHeaderMarginBottom: number;
    popupHeaderHeight: number;
}

export interface LayoutMap {
    compact: Layout;
    normal: Layout;
}
export type LayoutName = keyof LayoutMap;

export const layouts: LayoutMap = {
    compact: {
        tabPaddingTop: 0,
        tabPaddingBottom: 0,
        tabMarginTop: 0,
        tabMarginBottom: 0,
        windowHeaderHeight: '2.167rem', // 26px @ 12px font
        sectionPaddingTop: 6,
        sectionPaddingBottom: 4,
        sectionHeaderFontSize: '1.0rem', // 12px @ 12px font
        sectionHeaderMarginBottom: 4,
        popupHeaderHeight: 40
    },
    normal: {
        tabPaddingTop: 2,
        tabPaddingBottom: 2,
        tabMarginTop: 2,
        tabMarginBottom: 2,
        windowHeaderHeight: '2.5rem', // 30px @ 12px font
        sectionPaddingTop: 12,
        sectionPaddingBottom: 8,
        sectionHeaderFontSize: '1.167rem', // 14px @ 12px font
        sectionHeaderMarginBottom: 8,
        popupHeaderHeight: 44
    }
};
export const LayoutContext = React.createContext(
    layouts.normal // default value
);
