import { IPDFViewerApplication } from './options/pdf-viewer-application';
export interface PdfDocumentInfo {
    author?: string;
    creationDate?: Date;
    creator?: string;
    keywords?: string;
    linearized?: boolean;
    maybeFileSize?: string;
    modificationDate?: Date;
    pdfFormatVersion?: string;
    producer?: string;
    subject?: string;
    title?: string;
}
export declare class PdfDocumentPropertiesExtractor {
    private pdfDateStringRegex;
    getDocumentProperties(PDFViewerApplication: IPDFViewerApplication): Promise<any>;
    /** shamelessly copied from pdf.js */
    private toDateObject;
}
