import { MessageService } from '@theia/core';
import { DialogProps, Message } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import * as React from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormLabel from '@mui/material/FormLabel';
import { MControl, TriggerConfig } from './common/trigger-interface';
import { UUID } from '@theia/core/shared/@lumino/coreutils';

@injectable()
export class SecondStepDialogProps extends DialogProps {}

interface DialogState {
  sizehi: string;
  maskmax: string;
  sizelo: string;
  match: string;
  action: string;
  dmode: boolean;
  timing: boolean;
  select: boolean;
  chain: boolean;
  machineMode: boolean;
  supervisorMode: boolean;
  userMode: boolean;
  matchControlType: string;
  triggerData: string;
}

@injectable()
export class SecondStepDialog extends ReactDialog<TriggerConfig> {
  @inject(MessageService)
  protected readonly messageService: MessageService;

  private setDialogState(partialState: Partial<DialogState>, shouldUpdate = false) {
    this.state = { ...this.state, ...partialState };
    SecondStepDialog.persistedState = { ...this.state };
    Object.assign(this.triggerConfig, this.toTriggerConfig());
    if (shouldUpdate) {
      this.update();
    }
  }

  public triggerConfig: Partial<TriggerConfig> = {};

  private toTriggerConfig(): TriggerConfig {
    return {
      name: 'MatchControlTrigger',
      id: UUID.uuid4(),
      isEnable: true,
      triggerType: 'mcontrol',
      mcontrolType: this.state.matchControlType,
      tdata1: {
        action: this.state.action,
        match: this.state.match,
        sizehi: this.state.sizehi,
        sizelo: this.state.sizelo,
        maskmax: this.state.maskmax,
        dmode: this.state.dmode,
        timing: this.state.timing,
        select: this.state.select,
        chain: this.state.chain,
        m: this.state.machineMode,
        s: this.state.supervisorMode,
        u: this.state.userMode,
      } as MControl,
      tdata2: this.state.triggerData || undefined,
    };
  }

  private static persistedState: DialogState = {
    sizehi: 'switch to debug mode',
    sizelo: 'switch to debug mode',
    match: 'switch to debug mode',
    action: 'switch to debug mode',
    maskmax: 'switch to debug mode',
    dmode: false,
    timing: false,
    select: false,
    chain: false,
    machineMode: false,
    supervisorMode: false,
    userMode: false,
    matchControlType: '',
    triggerData: '',
  };

  private state: DialogState;

  constructor(
    @inject(DialogProps) protected readonly props: DialogProps
  ) {
    super(props);
    this.state = { ...SecondStepDialog.persistedState };
    this.appendAcceptButton('Create Trigger');
    this.appendCloseButton('Back');

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  get value(): TriggerConfig {
    return this.toTriggerConfig();
  }

  private readonly handleSelectChange: (key: keyof DialogState) => (event: SelectChangeEvent) => void = (key) => (event) => {
    if (key === 'sizehi' || key === 'sizelo' || key === 'match' || key === 'action' || key === 'maskmax' || key === 'matchControlType') {
      this.state = { ...this.state, [key]: event.target.value };
      SecondStepDialog.persistedState = { ...this.state };
      Object.assign(this.triggerConfig, this.toTriggerConfig());
      this.update();
    }
  };

  private readonly handleCheckboxChange: (key: keyof DialogState) => (event: React.ChangeEvent<HTMLInputElement>) => void = (key) => (event) => {
    if (
      key === 'dmode' ||
      key === 'timing' ||
      key === 'select' ||
      key === 'chain' ||
      key === 'machineMode' ||
      key === 'supervisorMode' ||
      key === 'userMode'
    ) {
      this.state = { ...this.state, [key]: event.target.checked };
      SecondStepDialog.persistedState = { ...this.state };
      Object.assign(this.triggerConfig, this.toTriggerConfig());
      this.update();
    }
  };

  private readonly handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setDialogState({ triggerData: event.target.value });
  };

  // Validation methods
  private validateTriggerData(triggerData: string, matchControlType: string): string | null {
    const trimmedTriggerData = triggerData.trim();
    if (!trimmedTriggerData) {
      return 'Trigger data 2 is required.';
    }
    // Normalize to lowercase for consistency
    const normalizedTriggerData = trimmedTriggerData.toLowerCase();
    // Validate hexadecimal format (0x followed by 1 to 8 hex digits for 32-bit system)
    const hexRegex = /^0x[0-9a-f]{1,8}$/;
    if (!hexRegex.test(normalizedTriggerData)) {
      return 'Trigger data 2 must be a valid hexadecimal value with up to 8 digits.';
    }

    // Conditional validation based on matchControlType
    if (matchControlType === 'execute') {
      if (!/^0x80[0-9a-f]{0,6}$/.test(normalizedTriggerData)) {
        return 'For execute, Trigger data 2 must start with 0x80 followed by up to 6 hexadecimal digits (e.g., 0x80000000).';
      }
    } else if (matchControlType === 'store') {
      if (!/^0x40[0-9a-f]{0,6}$/.test(normalizedTriggerData)) {
        return 'For store, Trigger data 2 must start with 0x40 followed by up to 6 hexadecimal digits (e.g., 0x40000000).';
      }
    } else if (matchControlType === 'load') {
      if (!/^0x00[0-9a-f]{0,6}$/.test(normalizedTriggerData)) {
        return 'For load, Trigger data 2 must start with 0x00 followed by up to 6 hexadecimal digits (e.g., 0x00000000).';
      }
    } else if (matchControlType) {
      // If matchControlType is set but not execute, store, or load, allow any valid hex
      return null;
    }

    // Update the state with normalized value
    this.setDialogState({ triggerData: normalizedTriggerData });
    return null;
  }

  private validateMatchControlType(matchControlType: string): string | null {
    if (!matchControlType) {
      return 'Match control type is required.';
    }
    // Align with RISC-V mcontrol types
    const validMatchControlTypes = ['execute', 'load', 'store'];
    if (!validMatchControlTypes.includes(matchControlType)) {
      return "Match control type must be one of: ${validMatchControlTypes.join(', ')}.";
    }
    return null;
  }

  private validateModes(machineMode: boolean, supervisorMode: boolean, userMode: boolean): string | null {
    if (!machineMode && !supervisorMode && !userMode) {
      return 'Please select at least one mode (Machine, Supervisor, or User).';
    }
    return null;
  }

  protected override async accept(): Promise<void> {
    const {
      triggerData,
      matchControlType,
      machineMode,
      supervisorMode,
      userMode,
    } = this.state;

    // Collect all errors
    const errors: string[] = [];

    // Validate triggerData
    const triggerDataError = this.validateTriggerData(triggerData, matchControlType);
    if (triggerDataError) {
      errors.push(triggerDataError);
    }

    // Validate matchControlType
    const matchControlTypeError = this.validateMatchControlType(matchControlType);
    if (matchControlTypeError) {
      errors.push(matchControlTypeError);
    }

    // Validate modes
    const modesError = this.validateModes(machineMode, supervisorMode, userMode);
    if (modesError) {
      errors.push(modesError);
    }

    // Display all errors if any
    if (errors.length > 0) {
      this.messageService.error(errors.join('\n'));
      return;
    }

    // If no errors, proceed
    Object.assign(this.triggerConfig, this.toTriggerConfig());
    this.messageService.info('Trigger configuration accepted.');
    super.accept();
  }

  protected render(): React.ReactNode {
    const loaderLine = document.getElementById('loader-line') as HTMLInputElement;
    if (loaderLine) {
      loaderLine.classList.remove('xplor-ide-loader-line');
    }

    const FormGrid = styled(Grid)(() => ({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      margin: 0,
      padding: 0,
    }));

    const commonSelectStyle = {
      '& .MuiInputBase-root': {
        height: 40,
      },
      backgroundColor: '#41414C',
      color: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'none' },
      '& .MuiSelect-icon': { color: '#ffffff' },
    };

    const commonMenuProps = {
      PaperProps: {
        sx: {
          backgroundColor: '#2c2c34',
          color: '#ffffff',
          '& .MuiMenuItem-root': {
            '&.Mui-selected': {
              backgroundColor: '#3a3a45',
            },
            '&:hover': {
              backgroundColor: '#50505f',
            },
          },
        },
      },
    };

    // Dynamically set placeholder based on matchControlType
    let triggerDataPlaceholder = 'Enter Trigger data 2';
    if (this.state.matchControlType === 'execute') {
      triggerDataPlaceholder = 'Enter Trigger data 2 (e.g., 0x80... for execute)';
    } else if (this.state.matchControlType === 'load') {
      triggerDataPlaceholder = 'Enter Trigger data 2 (e.g., 0x00... for load)';
    } else if (this.state.matchControlType === 'store') {
      triggerDataPlaceholder = 'Enter Trigger data 2 (e.g., 0x40... for store)';
    }

    return (
      <div style={{ padding: 0, paddingLeft: -16, backgroundColor: 'none', color: '#ffffff', width: '100%' }}>
        <FormGrid container spacing={2}>
          {/* sizehi and sizelo */}
          <Grid container spacing={2} sx={{ margin: 0, width: '100%' }}>
            <Grid item xs={6} sx={{ padding: 0 }}>
              <FormGrid>
                <FormLabel
                  htmlFor="trigger-name"
                  className="title-form"
                  sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
                >
                  Sizehi
                </FormLabel>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={this.state.sizehi}
                    onChange={this.handleSelectChange('sizehi')}
                    sx={commonSelectStyle}
                    MenuProps={commonMenuProps}
                  >
                    <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                    <MenuItem value="switch to mode">switch to mode</MenuItem>
                    <MenuItem value="switch to debug">switch to debug</MenuItem>
                  </Select>
                </FormControl>
              </FormGrid>
            </Grid>
            <Grid item xs={6} sx={{ padding: 0 }}>
              <FormGrid>
                <FormLabel
                  htmlFor="trigger-name"
                  className="title-form"
                  sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
                >
                  Sizelo
                </FormLabel>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={this.state.sizelo}
                    onChange={this.handleSelectChange('sizelo')}
                    sx={commonSelectStyle}
                    MenuProps={commonMenuProps}
                  >
                    <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                    <MenuItem value="switch to mode">switch to mode</MenuItem>
                  </Select>
                </FormControl>
              </FormGrid>
            </Grid>
          </Grid>

          {/* Match and Action */}
          <Grid container spacing={2} sx={{ mt: 0.5, margin: 0, width: '100%' }}>
            <Grid item xs={6} sx={{ padding: 0 }}>
              <FormGrid>
                <FormLabel
                  htmlFor="trigger-name"
                  className="title-form"
                  sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
                >
                  Match
                </FormLabel>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={this.state.match}
                    onChange={this.handleSelectChange('match')}
                    sx={commonSelectStyle}
                    MenuProps={commonMenuProps}
                  >
                    <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                    <MenuItem value="switch to debug">switch to debug</MenuItem>
                  </Select>
                </FormControl>
              </FormGrid>
            </Grid>
            <Grid item xs={6} sx={{ padding: 0 }}>
              <FormGrid>
                <FormLabel
                  htmlFor="trigger-name"
                  className="title-form"
                  sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
                >
                  Action
                </FormLabel>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={this.state.action}
                    onChange={this.handleSelectChange('action')}
                    sx={commonSelectStyle}
                    MenuProps={commonMenuProps}
                  >
                    <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                    <MenuItem value="switch to debug">switch to debug</MenuItem>
                  </Select>
                </FormControl>
              </FormGrid>
            </Grid>
          </Grid>

          {/* Maskmax */}
          <Grid container spacing={2} sx={{ mt: 0.5, margin: 0, width: '100%' }}>
            <Grid item xs={6} sx={{ padding: 0 }}>
              <FormGrid>
                <FormLabel
                  htmlFor="maskmax"
                  className="title-form"
                  sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
                >
                  Maskmax
                </FormLabel>
                <FormControl fullWidth variant="outlined">
                  <Select
                    value={this.state.maskmax}
                    onChange={this.handleSelectChange('maskmax')}
                    sx={commonSelectStyle}
                    MenuProps={commonMenuProps}
                  >
                    <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                    <MenuItem value="max2">Max 2</MenuItem>
                    <MenuItem value="max3">Max 3</MenuItem>
                  </Select>
                </FormControl>
              </FormGrid>
            </Grid>
          </Grid>

          {/* Checkboxes - Row 1 (4 items) */}
          <Grid container spacing={2} sx={{ mt: 0.5, margin: 0, width: '100%' }}>
            <Grid item xs={3} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.dmode}
                    onChange={this.handleCheckboxChange('dmode')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>Dmode</Typography>}
              />
            </Grid>
            <Grid item xs={3} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.timing}
                    onChange={this.handleCheckboxChange('timing')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>Timing</Typography>}
              />
            </Grid>
            <Grid item xs={3} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.select}
                    onChange={this.handleCheckboxChange('select')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>Select</Typography>}
              />
            </Grid>
            <Grid item xs={3} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.chain}
                    onChange={this.handleCheckboxChange('chain')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>Chain</Typography>}
              />
            </Grid>
          </Grid>

          <Grid container sx={{ mt: 1, marginTop: '15px', marginBottom: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Grid item xs={8}>
              <Divider sx={{ backgroundColor: '#ffffff', opacity: 0.5 }} />
            </Grid>
          </Grid>

          {/* Centered Title between 2 checkbox rows */}
          <Grid container sx={{ mt: 1, margin: 0, width: '100%', paddingLeft: '16px' }}>
            <Typography sx={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }} className='title-form'>
              Choose at least one mode <span style={{ color: 'red' }}>*</span>:
            </Typography>
          </Grid>

          {/* Checkboxes - Row 2 (3 items) */}
          <Grid container spacing={2} sx={{ margin: 0, marginTop: '-15px', width: '100%' }}>
            <Grid item xs={4} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.machineMode}
                    onChange={this.handleCheckboxChange('machineMode')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>Machine mode</Typography>}
              />
            </Grid>
            <Grid item xs={4} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.supervisorMode}
                    onChange={this.handleCheckboxChange('supervisorMode')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>Supervisor mode</Typography>}
              />
            </Grid>
            <Grid item xs={4} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.userMode}
                    onChange={this.handleCheckboxChange('userMode')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>User mode</Typography>}
              />
            </Grid>
          </Grid>

          {/* Match Control Type */}
          <Grid item xs={12} sx={{ mt: 1, padding: 0 }}>
            <FormGrid>
              <FormLabel
                htmlFor="trigger-name"
                className="title-form"
                sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
              >
                Match control type <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <FormControl fullWidth variant="outlined">
                <Select
                  value={this.state.matchControlType}
                  onChange={this.handleSelectChange('matchControlType')}
                  sx={commonSelectStyle}
                  MenuProps={commonMenuProps}
                  displayEmpty
                >
                  <MenuItem value="">Select type</MenuItem>
                  <MenuItem value="execute">Execute</MenuItem>
                  <MenuItem value="load">Load</MenuItem>
                  <MenuItem value="store">Store</MenuItem>
                </Select>
              </FormControl>
            </FormGrid>
          </Grid>

          {/* Trigger Data */}
          <Grid item xs={12} sx={{ mt: 1, padding: 0 }}>
            <FormControl fullWidth>
              <FormLabel
                htmlFor="trigger-name"
                className="title-form"
                sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
              >
                Trigger data 2 <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <TextField
                fullWidth
                variant="outlined"
                defaultValue={this.state.triggerData}
                onChange={(e) => {
                  this.state.triggerData = e.target.value;
                  SecondStepDialog.persistedState.triggerData = e.target.value;
                  Object.assign(this.triggerConfig, this.toTriggerConfig());
                }}
                placeholder={triggerDataPlaceholder}
                sx={{
                  '& .MuiInputBase-root': {
                    height: 40,
                    backgroundColor: '#41414C',
                    color: '#ffffff',
                  },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'none' },
                }}
              />
            </FormControl>
          </Grid>
        </FormGrid>
      </div>
    );
  }

  protected override onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.update();
  }

  @postConstruct()
  protected init(): void {
    this.title.label = 'Add Match Control Trigger';
    this.state = { ...SecondStepDialog.persistedState };
    Object.assign(this.triggerConfig, this.toTriggerConfig());
    console.log('TriggerConfig:', this.triggerConfig);
  }

  public async openWithData(trigger: TriggerConfig, isEdit = true): Promise<TriggerConfig | undefined> {
    // Khởi tạo trạng thái mặc định
    const defaultState: DialogState = {
        triggerData: trigger.tdata2 || '',
        sizehi: 'switch to debug mode',
        sizelo: 'switch to debug mode',
        match: 'switch to debug mode',
        action: 'switch to debug mode',
        maskmax: 'switch to debug mode',
        dmode: false,
        timing: false,
        select: false,
        chain: false,
        machineMode: false,
        supervisorMode: false,
        userMode: false,
        matchControlType: trigger.mcontrolType || '',
    };

    // Nếu triggerType là mcontrol, sử dụng các giá trị từ tdata1 (MControl)
    if (trigger.triggerType === 'mcontrol' && trigger.tdata1) {
        const mcontrol = trigger.tdata1 as MControl;
        console.log('tdata1', trigger.tdata1);
        this.setDialogState({
            ...defaultState,
            sizehi: mcontrol.sizehi || defaultState.sizehi,
            sizelo: mcontrol.sizelo || defaultState.sizelo,
            match: mcontrol.match || defaultState.match,
            action: mcontrol.action || defaultState.action,
            maskmax: mcontrol.maskmax || defaultState.maskmax,
            dmode: mcontrol.dmode || defaultState.dmode,
            timing: mcontrol.timing || defaultState.timing,
            select: mcontrol.select || defaultState.select,
            chain: mcontrol.chain || defaultState.chain,
            machineMode: mcontrol.m || defaultState.machineMode,
            supervisorMode: mcontrol.s || defaultState.supervisorMode,
            userMode: mcontrol.u || defaultState.userMode,
            matchControlType: trigger.mcontrolType || defaultState.matchControlType,
            triggerData: trigger.tdata2 || defaultState.triggerData,
        }, true);
    } else {
        // Nếu không phải mcontrol (ví dụ: icount), sử dụng giá trị mặc định
        this.setDialogState(defaultState, true);
    }

    this.title.label = isEdit ? 'Edit Trigger' : 'Create Trigger';
    this.clearAcceptButton();
    this.appendAcceptButton(isEdit ? 'Edit Trigger' : 'Create Triggers');
    this.update();

    return super.open();
}

    private clearAcceptButton(): void {
      const buttons = this['acceptButton'] ? [this['acceptButton']] : [];
      buttons.forEach(button => button.remove());
      this['acceptButton'] = undefined;
    }

  public override close(): void {
    super.close();
  }
}