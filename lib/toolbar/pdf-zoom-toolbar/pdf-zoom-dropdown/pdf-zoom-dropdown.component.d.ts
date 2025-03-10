import { ElementRef } from '@angular/core';
import { ResponsiveVisibility } from '../../../responsive-visibility';
import * as i0 from "@angular/core";
interface ZoomLevel {
    id: string;
    dataL10nId: string;
    dataL10nArgs: string | undefined;
    value: string;
    displayValue: string;
}
export declare class PdfZoomDropdownComponent {
    private element;
    showZoomDropdown: ResponsiveVisibility;
    _zoomLevels: Array<ZoomLevel>;
    set zoomLevels(levels: Array<string | number>);
    sizeSelector: any;
    constructor(element: ElementRef);
    private valueToZoomLevel;
    private snakeToCamel;
    static ɵfac: i0.ɵɵFactoryDeclaration<PdfZoomDropdownComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<PdfZoomDropdownComponent, "pdf-zoom-dropdown", never, { "showZoomDropdown": { "alias": "showZoomDropdown"; "required": false; }; "zoomLevels": { "alias": "zoomLevels"; "required": false; }; }, {}, never, never, false, never>;
}
export {};
