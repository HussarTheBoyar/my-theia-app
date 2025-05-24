export interface TriggerConfig {
  name: string;
  id: string;
  isEnable: boolean;
  hartId?: number;
  triggerType: 'mcontrol' | 'icount' | 'itrigger' | 'etrigger'; // Added triggerType here
  mcontrolType?: string; // execute/store/load for mcontrolType
  tdata1: MControl | ICount;
  tdata2?: string; // bitmask for mie-style interrupts (e.g. "0x00000800")
  tdata3?: {
    mselect?: number;
    mvalue?: number;
  };
}

// --- MControl ---
export interface MControl {
  type: 2;
  dmode: boolean;
  maskmax: number;
  hit?: 0 | 1;
  select: boolean;
  timing: number;
  sizelo: number;
  sizehi?: number; // Added sizehi property
  action: number;
  match: number;
  m: boolean;
  s: boolean;
  u: boolean;
  execute: boolean;
  store: boolean;
  load: boolean;
}

// --- ICount ---
export interface ICount {
  type: 3;
  dmode: boolean;
  action: number;
  count: number;
  hit?: 0 | 1;
  m: boolean;
  s: boolean;
  u: boolean;
}