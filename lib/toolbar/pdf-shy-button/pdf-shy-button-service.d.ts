import { SafeHtml } from '@angular/platform-browser';
import { PDFNotificationService } from '../../pdf-notification-service';
import { ResponsiveCSSClass } from '../../responsive-visibility';
import { PdfShyButtonComponent } from './pdf-shy-button.component';
import * as i0 from "@angular/core";
export interface PdfShyButtonDescription {
    id: string;
    cssClass: ResponsiveCSSClass;
    l10nId: string;
    l10nLabel: string;
    title: string;
    toggled: boolean;
    disabled: boolean;
    order: number;
    image: string | SafeHtml | undefined;
    action?: () => void;
    eventBusName?: string;
    closeOnClick?: boolean;
}
export declare class PdfShyButtonService {
    notificationService: PDFNotificationService;
    buttons: PdfShyButtonDescription[];
    private PDFViewerApplication;
    constructor(notificationService: PDFNotificationService);
    add(button: PdfShyButtonComponent): void;
    private addDefaultPrefix;
    update(button: PdfShyButtonComponent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PdfShyButtonService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PdfShyButtonService>;
}
