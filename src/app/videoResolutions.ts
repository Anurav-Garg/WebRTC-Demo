export interface videoResolution {
  name: string;
  width: {
    exact: number;
  };
  height: {
    exact: number;
  };
}

export const videoResolutions: videoResolution[] = [
  {
    name: 'QVGA',
    width: { exact: 320 },
    height: { exact: 240 },
  },

  {
    name: 'VGA',
    width: { exact: 640 },
    height: { exact: 480 },
  },

  {
    name: 'HD',
    width: { exact: 1280 },
    height: { exact: 720 },
  },

  {
    name: 'Full HD',
    width: { exact: 1920 },
    height: { exact: 1080 },
  },

  {
    name: '4k',
    width: { exact: 3840 },
    height: { exact: 2160 },
  },
];
