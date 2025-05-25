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
  maskmax: string;
  hit?: 0 | 1;
  select: boolean;
  timing: boolean;
  sizelo: string;
  sizehi?: string; // Added sizehi property
  action: string;
  match: string;
  chain: boolean;
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
  action: string;
  count: number;
  hit?: 0 | 1;
  m: boolean;
  s: boolean;
  u: boolean;
}