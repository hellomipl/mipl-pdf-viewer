import { EditorAnnotation } from './editor-annotations';
import { OptionalContentConfig } from './optional_content_config';
import { PDFPageView } from './pdf_page_view';
export declare enum ScrollModeType {
    vertical = 0,
    horizontal = 1,
    wrapped = 2,
    page = 3
}
export declare enum SpreadModeType {
    UNKNOWN = -1,
    NONE = 0,
    ODD = 1,
    EVEN = 2
}
export type PageViewModeType = 'single' | 'book' | 'multiple' | 'infinite-scroll';
export interface ScrollModeChangedEvent {
    mode: ScrollModeType;
}
export interface IPDFRenderingQueue {
    getHighestPriority(visiblePage: Array<any>, pages: Array<any>, scrolledDown: boolean, preRenderExtra: boolean): any;
}
export interface IPDFViewer {
    maxZoom: number;
    minZoom: number;
    setTextLayerMode(textLayerMode: number): unknown;
    annotationEditorMode: any;
    currentPageLabel: string | undefined;
    currentPageNumber: number;
    enablePrintAutoRotate: boolean;
    currentScaleValue: string | number;
    pagesRotation: 0 | 90 | 180 | 270;
    removePageBorders: boolean;
    renderingQueue: IPDFRenderingQueue;
    scrollMode: ScrollModeType;
    pageViewMode: PageViewModeType;
    spreadMode: 0 | 1 | 2;
    _pages: Array<PDFPageView>;
    addPageToRenderQueue(pageIndex: number): boolean;
    _getVisiblePages(): Array<any>;
    optionalContentConfigPromise: Promise<OptionalContentConfig> | null;
    _scrollPageIntoView({ pageDiv, pageSpot, pageNumber }: {
        pageDiv: HTMLElement;
        pageSpot: any;
        pageNumber: number;
    }): void;
    getSerializedAnnotations(): EditorAnnotation[] | null;
    addEditorAnnotation(serialized: string | EditorAnnotation): void;
    removeEditorAnnotations(filter?: (serialized: EditorAnnotation) => boolean): void;
    getPageView(index: number): PDFPageView;
    destroyBookMode(): void;
    stopRendering(): void;
}
