import { Component, Input, effect } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../pdf-notification-service";
import * as i2 from "../pdf-shy-button/pdf-shy-button.component";
import * as i3 from "../../responsive-visibility";
export class PdfNoSpreadComponent {
    notificationService;
    show = true;
    spread = 'off';
    scrollMode;
    PDFViewerApplication;
    constructor(notificationService) {
        this.notificationService = notificationService;
        effect(() => {
            this.PDFViewerApplication = notificationService.onPDFJSInitSignal();
            if (this.PDFViewerApplication) {
                this.onPdfJsInit();
            }
        });
    }
    onPdfJsInit() {
        this.PDFViewerApplication?.eventBus.on('spreadmodechanged', (event) => {
            queueMicrotask(() => {
                const modes = ['off', 'odd', 'even'];
                this.spread = modes[event.mode];
            });
        });
    }
    onClick() {
        if (this.PDFViewerApplication) {
            this.PDFViewerApplication.pdfViewer.spreadMode = 0;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfNoSpreadComponent, deps: [{ token: i1.PDFNotificationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: PdfNoSpreadComponent, selector: "pdf-no-spread", inputs: { show: "show", scrollMode: "scrollMode" }, ngImport: i0, template: "<pdf-shy-button\n  [cssClass]=\"show | responsiveCSSClass : 'always-in-secondary-menu'\"\n  title=\"Do not join page spreads\"\n  primaryToolbarId=\"spreadNone\"\n  l10nId=\"pdfjs-spread-none-button\"\n  [toggled]=\"spread === 'off'\"\n  [action]=\"onClick\"\n  l10nLabel=\"pdfjs-spread-none-button-label\"\n  [order]=\"2000\"\n  [closeOnClick]=\"false\"\n  [disabled]=\"scrollMode === 1\"\n  image=\"<svg class='pdf-margin-top-3px' width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M6 3c-1 0-1.5.5-1.5 1.5v7c0 1 .5 1.5 1.5 1.5h4c1 0 1.5-.5 1.5-1.5v-7c0-1-.5-1.5-1.5-1.5z' /></svg>\"\n>\n</pdf-shy-button>\n", styles: ["button{padding:0;margin-top:0;margin-bottom:0}\n"], dependencies: [{ kind: "component", type: i2.PdfShyButtonComponent, selector: "pdf-shy-button", inputs: ["primaryToolbarId", "secondaryMenuId", "cssClass", "eventBusName", "l10nId", "l10nLabel", "title", "toggled", "disabled", "order", "action", "closeOnClick", "onlySecondaryMenu", "image"] }, { kind: "pipe", type: i3.ResponsiveCSSClassPipe, name: "responsiveCSSClass" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: PdfNoSpreadComponent, decorators: [{
            type: Component,
            args: [{ selector: 'pdf-no-spread', template: "<pdf-shy-button\n  [cssClass]=\"show | responsiveCSSClass : 'always-in-secondary-menu'\"\n  title=\"Do not join page spreads\"\n  primaryToolbarId=\"spreadNone\"\n  l10nId=\"pdfjs-spread-none-button\"\n  [toggled]=\"spread === 'off'\"\n  [action]=\"onClick\"\n  l10nLabel=\"pdfjs-spread-none-button-label\"\n  [order]=\"2000\"\n  [closeOnClick]=\"false\"\n  [disabled]=\"scrollMode === 1\"\n  image=\"<svg class='pdf-margin-top-3px' width='24px' height='24px' viewBox='0 0 24 24'><path fill='currentColor' d='M6 3c-1 0-1.5.5-1.5 1.5v7c0 1 .5 1.5 1.5 1.5h4c1 0 1.5-.5 1.5-1.5v-7c0-1-.5-1.5-1.5-1.5z' /></svg>\"\n>\n</pdf-shy-button>\n", styles: ["button{padding:0;margin-top:0;margin-bottom:0}\n"] }]
        }], ctorParameters: () => [{ type: i1.PDFNotificationService }], propDecorators: { show: [{
                type: Input
            }], scrollMode: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLW5vLXNwcmVhZC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZXh0ZW5kZWQtcGRmLXZpZXdlci9zcmMvbGliL3Rvb2xiYXIvcGRmLW5vLXNwcmVhZC9wZGYtbm8tc3ByZWFkLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1leHRlbmRlZC1wZGYtdmlld2VyL3NyYy9saWIvdG9vbGJhci9wZGYtbm8tc3ByZWFkL3BkZi1uby1zcHJlYWQuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7OztBQVl6RCxNQUFNLE9BQU8sb0JBQW9CO0lBV1g7SUFUYixJQUFJLEdBQXlCLElBQUksQ0FBQztJQUVsQyxNQUFNLEdBQWUsS0FBSyxDQUFDO0lBRzNCLFVBQVUsQ0FBaUI7SUFFMUIsb0JBQW9CLENBQW9DO0lBRWhFLFlBQW9CLG1CQUEyQztRQUEzQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXdCO1FBQzdELE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFJLENBQUMsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNwRSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ3BCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sV0FBVztRQUNoQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3BFLGNBQWMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xCLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQXNCLENBQUM7Z0JBQzFELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLE9BQU87UUFDWixJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM3QixJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7U0FDcEQ7SUFDSCxDQUFDO3dHQWpDVSxvQkFBb0I7NEZBQXBCLG9CQUFvQix5R0NaakMsMm5CQWNBOzs0RkRGYSxvQkFBb0I7a0JBTGhDLFNBQVM7K0JBQ0UsZUFBZTsyRkFNbEIsSUFBSTtzQkFEVixLQUFLO2dCQU1DLFVBQVU7c0JBRGhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBlZmZlY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNjcm9sbE1vZGVUeXBlIH0gZnJvbSAnLi4vLi4vb3B0aW9ucy9wZGYtdmlld2VyJztcbmltcG9ydCB7IElQREZWaWV3ZXJBcHBsaWNhdGlvbiB9IGZyb20gJy4uLy4uL29wdGlvbnMvcGRmLXZpZXdlci1hcHBsaWNhdGlvbic7XG5pbXBvcnQgeyBTcHJlYWRUeXBlIH0gZnJvbSAnLi4vLi4vb3B0aW9ucy9zcHJlYWQtdHlwZSc7XG5pbXBvcnQgeyBQREZOb3RpZmljYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vcGRmLW5vdGlmaWNhdGlvbi1zZXJ2aWNlJztcbmltcG9ydCB7IFJlc3BvbnNpdmVWaXNpYmlsaXR5IH0gZnJvbSAnLi4vLi4vcmVzcG9uc2l2ZS12aXNpYmlsaXR5JztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGRmLW5vLXNwcmVhZCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9wZGYtbm8tc3ByZWFkLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcGRmLW5vLXNwcmVhZC5jb21wb25lbnQuY3NzJ10sXG59KVxuZXhwb3J0IGNsYXNzIFBkZk5vU3ByZWFkQ29tcG9uZW50IHtcbiAgQElucHV0KClcbiAgcHVibGljIHNob3c6IFJlc3BvbnNpdmVWaXNpYmlsaXR5ID0gdHJ1ZTtcblxuICBwdWJsaWMgc3ByZWFkOiBTcHJlYWRUeXBlID0gJ29mZic7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHNjcm9sbE1vZGU6IFNjcm9sbE1vZGVUeXBlO1xuXG4gIHByaXZhdGUgUERGVmlld2VyQXBwbGljYXRpb246IElQREZWaWV3ZXJBcHBsaWNhdGlvbiB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5vdGlmaWNhdGlvblNlcnZpY2U6IFBERk5vdGlmaWNhdGlvblNlcnZpY2UpIHtcbiAgICBlZmZlY3QoKCkgPT4ge1xuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbiA9IG5vdGlmaWNhdGlvblNlcnZpY2Uub25QREZKU0luaXRTaWduYWwoKTtcbiAgICAgIGlmICh0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uKSB7XG4gICAgICAgIHRoaXMub25QZGZKc0luaXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvblBkZkpzSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLlBERlZpZXdlckFwcGxpY2F0aW9uPy5ldmVudEJ1cy5vbignc3ByZWFkbW9kZWNoYW5nZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgY29uc3QgbW9kZXMgPSBbJ29mZicsICdvZGQnLCAnZXZlbiddIGFzIEFycmF5PFNwcmVhZFR5cGU+O1xuICAgICAgICB0aGlzLnNwcmVhZCA9IG1vZGVzW2V2ZW50Lm1vZGVdO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb25DbGljaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbikge1xuICAgICAgdGhpcy5QREZWaWV3ZXJBcHBsaWNhdGlvbi5wZGZWaWV3ZXIuc3ByZWFkTW9kZSA9IDA7XG4gICAgfVxuICB9XG59XG4iLCI8cGRmLXNoeS1idXR0b25cbiAgW2Nzc0NsYXNzXT1cInNob3cgfCByZXNwb25zaXZlQ1NTQ2xhc3MgOiAnYWx3YXlzLWluLXNlY29uZGFyeS1tZW51J1wiXG4gIHRpdGxlPVwiRG8gbm90IGpvaW4gcGFnZSBzcHJlYWRzXCJcbiAgcHJpbWFyeVRvb2xiYXJJZD1cInNwcmVhZE5vbmVcIlxuICBsMTBuSWQ9XCJwZGZqcy1zcHJlYWQtbm9uZS1idXR0b25cIlxuICBbdG9nZ2xlZF09XCJzcHJlYWQgPT09ICdvZmYnXCJcbiAgW2FjdGlvbl09XCJvbkNsaWNrXCJcbiAgbDEwbkxhYmVsPVwicGRmanMtc3ByZWFkLW5vbmUtYnV0dG9uLWxhYmVsXCJcbiAgW29yZGVyXT1cIjIwMDBcIlxuICBbY2xvc2VPbkNsaWNrXT1cImZhbHNlXCJcbiAgW2Rpc2FibGVkXT1cInNjcm9sbE1vZGUgPT09IDFcIlxuICBpbWFnZT1cIjxzdmcgY2xhc3M9J3BkZi1tYXJnaW4tdG9wLTNweCcgd2lkdGg9JzI0cHgnIGhlaWdodD0nMjRweCcgdmlld0JveD0nMCAwIDI0IDI0Jz48cGF0aCBmaWxsPSdjdXJyZW50Q29sb3InIGQ9J002IDNjLTEgMC0xLjUuNS0xLjUgMS41djdjMCAxIC41IDEuNSAxLjUgMS41aDRjMSAwIDEuNS0uNSAxLjUtMS41di03YzAtMS0uNS0xLjUtMS41LTEuNXonIC8+PC9zdmc+XCJcbj5cbjwvcGRmLXNoeS1idXR0b24+XG4iXX0=