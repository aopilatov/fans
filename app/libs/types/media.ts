export interface MediaObjects {
  [uuid: string]: MediaObject;
}

export interface MediaObject {
  [width: number]: Media;
}

export interface Media {
  uuid: string;
  type: 'image' | 'video';
  width: number;
  height: number;
  origin?: string;
  none200?: string;
  blur200?: string;
}
