import { Component, effect, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../../pdf-notification-service";
import * as i2 from "../../pdf-shy-button/pdf-shy-button.component";
import * as i3 from "../../../responsive-visibility";
export class PdfZoomOutComponent {
    showZoomButtons = true;
    disabled = true;
    PDFViewerApplication;
    eventListener = ({ source, scale }) => {
        const minZoom = source.minZoom;
        if (minZoom) {
            this.disabled = scale <= minZoom;
        }
        else {
            this.disabled = false;
        }
    };
    constructor(notificationService) {
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
            if (this.PDFViewerApplication) {
                this.onPdfJsInit();
            }
        });
    }
    onPdfJsInit() {
        this.PDFViewerApplication?.eventBus.on('scalechanging', this.eventListener);
    }
    ngOnDestroy() {
        this.PDFViewerApplication?.eventBus.off('scalechanging', this.eventListener);
        this.PDFViewerApplication = undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfZoomOutComponent, deps: [{ token: i1.PDFNotificationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfZoomOutComponent, selector: "pdf-zoom-out", inputs: { showZoomButtons: "showZoomButtons" }, ngImport: i0, template: "<pdf-shy-button\n  primaryToolbarId=\"primaryZoomOut\"\n  class=\"zoomOut\"\n  title=\"Zoom Out\"\n  l10nId=\"pdfjs-zoom-out-button\"\n  l10nLabel=\"pdfjs-zoom-out-button-label\"\n  eventBusName=\"zoomout\"\n  [cssClass]=\"showZoomButtons | responsiveCSSClass : 'always-visible'\"\n  [order]=\"1500\"\n  image=\"<svg width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M19,13H5V11H19V13Z' /></svg>\"\n  [disabled]=\"disabled\"\n>\n</pdf-shy-button>\n", styles: ["button{margin-left:-2px!important;margin-right:-2px!important;padding:0}\n"], dependencies: [{ kind: "component", type: i2.PdfShyButtonComponent, selector: "pdf-shy-button", inputs: ["primaryToolbarId", "secondaryMenuId", "cssClass", "eventBusName", "l10nId", "l10nLabel", "title", "toggled", "disabled", "order", "action", "closeOnClick", "onlySecondaryMenu", "image"] }, { kind: "pipe", type: i3.ResponsiveCSSClassPipe, name: "responsiveCSSClass" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfZoomOutComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-zoom-out', template: "<pdf-shy-button\n  primaryToolbarId=\"primaryZoomOut\"\n  class=\"zoomOut\"\n  title=\"Zoom Out\"\n  l10nId=\"pdfjs-zoom-out-button\"\n  l10nLabel=\"pdfjs-zoom-out-button-label\"\n  eventBusName=\"zoomout\"\n  [cssClass]=\"showZoomButtons | responsiveCSSClass : 'always-visible'\"\n  [order]=\"1500\"\n  image=\"<svg width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M19,13H5V11H19V13Z' /></svg>\"\n  [disabled]=\"disabled\"\n>\n</pdf-shy-button>\n", styles: ["button{margin-left:-2px!important;margin-right:-2px!important;padding:0}\n"] }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }], propDecorators: { showZoomButtons: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLXpvb20tb3V0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtem9vbS10b29sYmFyL3BkZi16b29tLW91dC9wZGYtem9vbS1vdXQuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWV4dGVuZGVkLXBkZi12aWV3ZXIvc3JjL2xpYi90b29sYmFyL3BkZi16b29tLXRvb2xiYXIvcGRmLXpvb20tb3V0L3BkZi16b29tLW91dC5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQWEsTUFBTSxlQUFlLENBQUM7Ozs7O0FBV3BFLE1BQU0sT0FBTyxtQkFBbUI7SUFFdkIsZUFBZSxHQUF5QixJQUFJLENBQUM7SUFFN0MsUUFBUSxHQUFHLElBQUksQ0FBQztJQUN2QixvQkFBb0IsQ0FBb0M7SUFFaEQsYUFBYSxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFzQixFQUFFLEVBQUU7UUFDaEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUMvQixJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxJQUFJLE9BQU8sQ0FBQztTQUNsQzthQUFNO1lBQ0wsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7U0FDdkI7SUFDSCxDQUFDLENBQUM7SUFFRixZQUFZLG1CQUEyQztRQUNyRCxNQUFNLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDcEUsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUNwQjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLFdBQVc7UUFDakIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRU0sV0FBVztRQUNoQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7SUFDeEMsQ0FBQzt3R0FoQ1UsbUJBQW1COzRGQUFuQixtQkFBbUIsb0dDWGhDLDRkQWFBOzs0RkRGYSxtQkFBbUI7a0JBTC9CLFNBQVM7K0JBQ0UsY0FBYzsyRkFNakIsZUFBZTtzQkFEckIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgZWZmZWN0LCBJbnB1dCwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTY2FsZUNoYW5naW5nRXZlbnQgfSBmcm9tICcuLi8uLi8uLi9ldmVudHMvc2NhbGUtY2hhbmdpbmctZXZlbnQnO1xuaW1wb3J0IHsgSVBERlZpZXdlckFwcGxpY2F0aW9uIH0gZnJvbSAnLi4vLi4vLi4vb3B0aW9ucy9wZGYtdmlld2VyLWFwcGxpY2F0aW9uJztcbmltcG9ydCB7IFBERk5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9wZGYtbm90aWZpY2F0aW9uLXNlcnZpY2UnO1xuaW1wb3J0IHsgUmVzcG9uc2l2ZVZpc2liaWxpdHkgfSBmcm9tICcuLi8uLi8uLi9yZXNwb25zaXZlLXZpc2liaWxpdHknO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdwZGYtem9vbS1vdXQnLFxuICB0ZW1wbGF0ZVVybDogJy4vcGRmLXpvb20tb3V0LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcGRmLXpvb20tb3V0LmNvbXBvbmVudC5jc3MnXSxcbn0pXG5leHBvcnQgY2xhc3MgUGRmWm9vbU91dENvbXBvbmVudCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzaG93Wm9vbUJ1dHRvbnM6IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBwdWJsaWMgZGlzYWJsZWQgPSB0cnVlO1xuICBQREZWaWV3ZXJBcHBsaWNhdGlvbjogSVBERlZpZXdlckFwcGxpY2F0aW9uIHwgdW5kZWZpbmVkO1xuXG4gIHByaXZhdGUgZXZlbnRMaXN0ZW5lciA9ICh7IHNvdXJjZSwgc2NhbGUgfTogU2NhbGVDaGFuZ2luZ0V2ZW50KSA9PiB7XG4gICAgY29uc3QgbWluWm9vbSA9IHNvdXJjZS5taW5ab29tO1xuICAgIGlmIChtaW5ab29tKSB7XG4gICAgICB0aGlzLmRpc2FibGVkID0gc2NhbGUgPD0gbWluWm9vbTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihub3RpZmljYXRpb25TZXJ2aWNlOiBQREZOb3RpZmljYXRpb25TZXJ2aWNlKSB7XG4gICAgZWZmZWN0KCgpID0+IHtcbiAgICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSBub3RpZmljYXRpb25TZXJ2aWNlLm9uUERGSlNJbml0U2lnbmFsKCk7XG4gICAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgICB0aGlzLm9uUGRmSnNJbml0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uUGRmSnNJbml0KCkge1xuICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24/LmV2ZW50QnVzLm9uKCdzY2FsZWNoYW5naW5nJywgdGhpcy5ldmVudExpc3RlbmVyKTtcbiAgfVxuXG4gIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5ldmVudEJ1cy5vZmYoJ3NjYWxlY2hhbmdpbmcnLCB0aGlzLmV2ZW50TGlzdGVuZXIpO1xuICAgIHRoaXMuUERGVmlld2VyQXBwbGljYXRpb24gPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsIjxwZGYtc2h5LWJ1dHRvblxuICBwcmltYXJ5VG9vbGJhcklkPVwicHJpbWFyeVpvb21PdXRcIlxuICBjbGFzcz1cInpvb21PdXRcIlxuICB0aXRsZT1cIlpvb20gT3V0XCJcbiAgbDEwbklkPVwicGRmanMtem9vbS1vdXQtYnV0dG9uXCJcbiAgbDEwbkxhYmVsPVwicGRmanMtem9vbS1vdXQtYnV0dG9uLWxhYmVsXCJcbiAgZXZlbnRCdXNOYW1lPVwiem9vbW91dFwiXG4gIFtjc3NDbGFzc109XCJzaG93Wm9vbUJ1dHRvbnMgfCByZXNwb25zaXZlQ1NTQ2xhc3MgOiAnYWx3YXlzLXZpc2libGUnXCJcbiAgW29yZGVyXT1cIjE1MDBcIlxuICBpbWFnZT1cIjxzdmcgd2lkdGg9JzI0cHgnIGhlaWdodD0nMjRweCcgdmlld0JveD0nMCAwIDI0IDI0Jz48cGF0aCBmaWxsPSdjdXJyZW50Q29sb3InIGQ9J00xOSwxM0g1VjExSDE5VjEzWicgLz48L3N2Zz5cIlxuICBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIlxuPlxuPC9wZGYtc2h5LWJ1dHRvbj5cbiJdfQ==