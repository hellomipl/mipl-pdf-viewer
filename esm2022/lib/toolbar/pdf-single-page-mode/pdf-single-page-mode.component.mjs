import { Component, EventEmitter, Input, Output, effect } from '@angular/core';
import { ScrollMode } from '../../options/pdf-scroll-mode';
import * as i0 from "@angular/core";
import * as i1 from "../../pdf-notification-service";
import * as i2 from "../pdf-shy-button/pdf-shy-button.component";
import * as i3 from "../../responsive-visibility";
export class PdfSinglePageModeComponent {
    notificationService;
    show = true;
    scrollMode;
    pageViewMode;
    pageViewModeChange = new EventEmitter();
    onClick;
    PDFViewerApplication;
    constructor(notificationService) {
        this.notificationService = notificationService;
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
            if (this.PDFViewerApplication) {
                this.onPdfJsInit();
            }
        });
        this.onClick = () => {
            queueMicrotask(() => {
                this.PDFViewerApplication?.eventBus.dispatch('switchscrollmode', { mode: ScrollMode.PAGE });
            });
        };
    }
    onPdfJsInit() {
        this.PDFViewerApplication?.eventBus.on('switchscrollmode', (event) => {
            queueMicrotask(() => {
                this.scrollMode = event.mode;
            });
        });
    }
    ngOnDestroy() {
        this.onClick = undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfSinglePageModeComponent, deps: [{ token: i1.PDFNotificationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfSinglePageModeComponent, selector: "pdf-single-page-mode", inputs: { show: "show", scrollMode: "scrollMode", pageViewMode: "pageViewMode" }, outputs: { pageViewModeChange: "pageViewModeChange" }, ngImport: i0, template: "<pdf-shy-button\n  [cssClass]=\"show | responsiveCSSClass : 'always-in-secondary-menu'\"\n  title=\"Use Page Scrolling\"\n  primaryToolbarId=\"scrollPage\"\n  [toggled]=\"scrollMode == 3\"\n  l10nId=\"pdfjs-scroll-page-button\"\n  [action]=\"onClick\"\n  l10nLabel=\"pdfjs-scroll-page-button-label\"\n  [order]=\"3000\"\n  [closeOnClick]=\"false\"\n  image=\"<svg width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M10,7V9H12V17H14V7H10Z' /></svg>\"\n>\n</pdf-shy-button>\n", styles: ["button{padding:0;margin-top:0;margin-bottom:0}\n"], dependencies: [{ kind: "component", type: i2.PdfShyButtonComponent, selector: "pdf-shy-button", inputs: ["primaryToolbarId", "secondaryMenuId", "cssClass", "eventBusName", "l10nId", "l10nLabel", "title", "toggled", "disabled", "order", "action", "closeOnClick", "onlySecondaryMenu", "image"] }, { kind: "pipe", type: i3.ResponsiveCSSClassPipe, name: "responsiveCSSClass" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfSinglePageModeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-single-page-mode', template: "<pdf-shy-button\n  [cssClass]=\"show | responsiveCSSClass : 'always-in-secondary-menu'\"\n  title=\"Use Page Scrolling\"\n  primaryToolbarId=\"scrollPage\"\n  [toggled]=\"scrollMode == 3\"\n  l10nId=\"pdfjs-scroll-page-button\"\n  [action]=\"onClick\"\n  l10nLabel=\"pdfjs-scroll-page-button-label\"\n  [order]=\"3000\"\n  [closeOnClick]=\"false\"\n  image=\"<svg width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M10,7V9H12V17H14V7H10Z' /></svg>\"\n>\n</pdf-shy-button>\n", styles: ["button{padding:0;margin-top:0;margin-bottom:0}\n"] }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }], propDecorators: { show: [{
                type: Input
            }], scrollMode: [{
                type: Input
            }], pageViewMode: [{
                type: Input
            }], pageViewModeChange: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLXNpbmdsZS1wYWdlLW1vZGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi90b29sYmFyL3BkZi1zaW5nbGUtcGFnZS1tb2RlL3BkZi1zaW5nbGUtcGFnZS1tb2RlLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtc2luZ2xlLXBhZ2UtbW9kZS9wZGYtc2luZ2xlLXBhZ2UtbW9kZS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQWEsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMxRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sK0JBQStCLENBQUM7Ozs7O0FBVzNELE1BQU0sT0FBTywwQkFBMEI7SUFpQmpCO0lBZmIsSUFBSSxHQUF5QixJQUFJLENBQUM7SUFHbEMsVUFBVSxDQUFpQjtJQUczQixZQUFZLENBQW1CO0lBRy9CLGtCQUFrQixHQUFHLElBQUksWUFBWSxFQUFvQixDQUFDO0lBRTFELE9BQU8sQ0FBYztJQUVwQixvQkFBb0IsQ0FBb0M7SUFFaEUsWUFBb0IsbUJBQTJDO1FBQTNDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBd0I7UUFDN0QsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3BFLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUM3QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ2xCLGNBQWMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzlGLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVNLFdBQVc7UUFDaEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNuRSxjQUFjLENBQUMsR0FBRyxFQUFFO2dCQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxXQUFXO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBQzNCLENBQUM7d0dBMUNVLDBCQUEwQjs0RkFBMUIsMEJBQTBCLHFNQ1p2QyxvZkFhQTs7NEZERGEsMEJBQTBCO2tCQUx0QyxTQUFTOytCQUNFLHNCQUFzQjsyRkFNekIsSUFBSTtzQkFEVixLQUFLO2dCQUlDLFVBQVU7c0JBRGhCLEtBQUs7Z0JBSUMsWUFBWTtzQkFEbEIsS0FBSztnQkFJQyxrQkFBa0I7c0JBRHhCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uRGVzdHJveSwgT3V0cHV0LCBlZmZlY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNjcm9sbE1vZGUgfSBmcm9tICcuLi8uLi9vcHRpb25zL3BkZi1zY3JvbGwtbW9kZSc7XG5pbXBvcnQgeyBQYWdlVmlld01vZGVUeXBlLCBTY3JvbGxNb2RlVHlwZSB9IGZyb20gJy4uLy4uL29wdGlvbnMvcGRmLXZpZXdlcic7XG5pbXBvcnQgeyBJUERGVmlld2VyQXBwbGljYXRpb24gfSBmcm9tICcuLi8uLi9vcHRpb25zL3BkZi12aWV3ZXItYXBwbGljYXRpb24nO1xuaW1wb3J0IHsgUERGTm90aWZpY2F0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uL3BkZi1ub3RpZmljYXRpb24tc2VydmljZSc7XG5pbXBvcnQgeyBSZXNwb25zaXZlVmlzaWJpbGl0eSB9IGZyb20gJy4uLy4uL3Jlc3BvbnNpdmUtdmlzaWJpbGl0eSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BkZi1zaW5nbGUtcGFnZS1tb2RlJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BkZi1zaW5nbGUtcGFnZS1tb2RlLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcGRmLXNpbmdsZS1wYWdlLW1vZGUuY29tcG9uZW50LmNzcyddLFxufSlcbmV4cG9ydCBjbGFzcyBQZGZTaW5nbGVQYWdlTW9kZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93OiBSZXNwb25zaXZlVmlzaWJpbGl0eSA9IHRydWU7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNjcm9sbE1vZGU6IFNjcm9sbE1vZGVUeXBlO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBwYWdlVmlld01vZGU6IFBhZ2VWaWV3TW9kZVR5cGU7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBwYWdlVmlld01vZGVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2VWaWV3TW9kZVR5cGU+KCk7XG5cbiAgcHVibGljIG9uQ2xpY2s/OiAoKSA9PiB2b2lkO1xuXG4gIHByaXZhdGUgUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbiB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5vdGlmaWNhdGlvblNlcnZpY2U6IFBERk5vdGlmaWNhdGlvblNlcnZpY2UpIHtcbiAgICBlZmZlY3QoKCkgPT4ge1xuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbiA9IG5vdGlmaWNhdGlvblNlcnZpY2Uub25QREZKU0luaXRTaWduYWwoKTtcbiAgICAgIGlmICh0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgICAgIHRoaXMub25QZGZKc0luaXQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub25DbGljayA9ICgpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uZXZlbnRCdXMuZGlzcGF0Y2goJ3N3aXRjaHNjcm9sbG1vZGUnLCB7IG1vZGU6IFNjcm9sbE1vZGUuUEFHRSB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb25QZGZKc0luaXQoKTogdm9pZCB7XG4gICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbj8uZXZlbnRCdXMub24oJ3N3aXRjaHNjcm9sbG1vZGUnLCAoZXZlbnQpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgdGhpcy5zY3JvbGxNb2RlID0gZXZlbnQubW9kZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMub25DbGljayA9IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwiPHBkZi1zaHktYnV0dG9uXG4gIFtjc3NDbGFzc109XCJzaG93IHwgcmVzcG9uc2l2ZUNTU0NsYXNzIDogJ2Fsd2F5cy1pbi1zZWNvbmRhcnktbWVudSdcIlxuICB0aXRsZT1cIlVzZSBQYWdlIFNjcm9sbGluZ1wiXG4gIHByaW1hcnlUb29sYmFySWQ9XCJzY3JvbGxQYWdlXCJcbiAgW3RvZ2dsZWRdPVwic2Nyb2xsTW9kZSA9PSAzXCJcbiAgbDEwbklkPVwicGRmanMtc2Nyb2xsLXBhZ2UtYnV0dG9uXCJcbiAgW2FjdGlvbl09XCJvbkNsaWNrXCJcbiAgbDEwbkxhYmVsPVwicGRmanMtc2Nyb2xsLXBhZ2UtYnV0dG9uLWxhYmVsXCJcbiAgW29yZGVyXT1cIjMwMDBcIlxuICBbY2xvc2VPbkNsaWNrXT1cImZhbHNlXCJcbiAgaW1hZ2U9XCI8c3ZnIHdpZHRoPScyNHB4JyBoZWlnaHQ9JzI0cHgnIHZpZXdCb3g9JzAgMCAyNCAyNCc+PHBhdGggZmlsbD0nY3VycmVudENvbG9yJyBkPSdNMTAsN1Y5SDEyVjE3SDE0VjdIMTBaJyAvPjwvc3ZnPlwiXG4+XG48L3BkZi1zaHktYnV0dG9uPlxuIl19