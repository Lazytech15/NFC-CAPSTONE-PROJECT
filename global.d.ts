// global.d.ts
declare class NDEFWriter {
    write: (message: NDEFMessageInit) => Promise<void>;
  }
  
  interface NDEFMessageInit {
    records: NDEFRecordInit[];
  }
  
  interface NDEFRecordInit {
    recordType: string;
    mediaType?: string;
    id?: string;
    data?: string | BufferSource | null;
  }
  
  interface Window {
    NDEFWriter: typeof NDEFWriter;
  }
  