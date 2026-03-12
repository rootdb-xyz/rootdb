export interface FileHost {
  id: string;
  name: string;
  upload_url: string;
  max_size_label: string;
  retention: string;
  notes?: string;
}

export const FILE_HOSTS: FileHost[] = [
  {
    id: "catbox",
    name: "Catbox.moe",
    upload_url: "https://catbox.moe/",
    max_size_label: "200 MB",
    retention: "Infinite",
    notes: "Best for small files — APKs, kernels, TWRP images",
  },
  {
    id: "quax",
    name: "qu.ax",
    upload_url: "https://qu.ax/",
    max_size_label: "256 MB",
    retention: "Infinite",
    notes: "Simple drag-and-drop host",
  },
  {
    id: "downloadgg",
    name: "Download.gg",
    upload_url: "https://download.gg/",
    max_size_label: "25 GB",
    retention: "Infinite",
    notes: "Best for huge Samsung Odin firmware ZIPs",
  },
  {
    id: "xda",
    name: "XDA File Host",
    upload_url: "https://xdaforums.com/",
    max_size_label: "Varies",
    retention: "Infinite (forum attachments)",
    notes: "Attach to your XDA thread",
  },
];