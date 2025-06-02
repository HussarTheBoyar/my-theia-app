import { MessageService } from '@theia/core';
import { DialogProps, Message } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import * as React from 'react';

import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import FormLabel from '@mui/material/FormLabel';
import { ICount, TriggerConfig } from './common/trigger-interface';
import { UUID } from '@theia/core/shared/@lumino/coreutils';

@injectable()
export class SecondStepIcountProps extends DialogProps {}

interface DialogState {
  action: string;
  count: string; // Kept as string for Select compatibility
  dmode: boolean;
  machineMode: boolean;
  supervisorMode: boolean;
  userMode: boolean;
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

@injectable()
export class SecondStepIcount extends ReactDialog<TriggerConfig> {
  @inject(MessageService)
  protected readonly messageService: MessageService;

  private readonly triggerConfig: Partial<TriggerConfig> = {};

  private static persistedState: DialogState = {
    action: 'switch to debug mode',
    count: '1',
    dmode: false,
    machineMode: false,
    supervisorMode: false,
    userMode: false,
  };

  private state: DialogState;

  constructor(
    @inject(DialogProps) protected readonly props: DialogProps
  ) {
    super(props);
    this.state = { ...SecondStepIcount.persistedState };
    this.appendCloseButton('Back');
    this.appendAcceptButton('Create Trigger');

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  get value(): TriggerConfig {
    return this.toTriggerConfig();
  }

  private setDialogState(partialState: Partial<DialogState>, shouldUpdate = false) {
    this.state = { ...this.state, ...partialState };
    SecondStepIcount.persistedState = { ...this.state };
    Object.assign(this.triggerConfig, this.toTriggerConfig());
    if (shouldUpdate) {
      this.update();
    }
  }

  private toTriggerConfig(): TriggerConfig {
    return {
      name: 'IcountTrigger',
      id: UUID.uuid4(),
      isEnable: true,
      triggerType: 'icount',
      tdata1: {
        type: 3,
        action: this.state.action,
        count: this.state.count ? parseInt(this.state.count, 10) : 0,
        dmode: this.state.dmode,
        m: this.state.machineMode,
        s: this.state.supervisorMode,
        u: this.state.userMode,
      } as ICount,
      tdata2: undefined,
    };
  }

  private readonly handleSelectChange: (key: keyof DialogState) => (event: SelectChangeEvent) => void = (key) => (event) => {
    this.setDialogState({ [key]: event.target.value }, true);
  };

  private readonly handleCheckboxChange: (key: keyof DialogState) => (event: React.ChangeEvent<HTMLInputElement>) => void = (key) => (event) => {
    if (
      key === 'dmode' ||
      key === 'machineMode' ||
      key === 'supervisorMode' ||
      key === 'userMode'
    ) {
      this.setDialogState({ [key]: event.target.checked }, true);
    }
  };

  private validateModes(machineMode: boolean, supervisorMode: boolean, userMode: boolean): string | null {
    const selectedModes = [machineMode, supervisorMode, userMode].filter(Boolean).length;
    if (selectedModes < 1) {
      return 'Please select at least one mode (Machine, Supervisor, or User).';
    }
    return null;
  }

  protected override async accept(): Promise<void> {
    const { machineMode, supervisorMode, userMode } = this.state;
    const errors: string[] = [];

    // Validate modes
    const modesError = this.validateModes(machineMode, supervisorMode, userMode);
    if (modesError) {
      errors.push(modesError);
    }

    if (errors.length > 0) {
      this.messageService.error(errors.join('\n'));
      return;
    }

    Object.assign(this.triggerConfig, this.toTriggerConfig());
    this.messageService.info('Trigger configuration accepted.');
    console.log('TriggerConfig:', this.triggerConfig);
    super.accept();
  }

  protected render(): React.ReactNode {
    const loaderLine = document.getElementById('loader-line') as HTMLInputElement;
    if (loaderLine) {
      loaderLine.classList.remove('xplor-ide-loader-line');
    }

    return (
      <div style={{ padding: 0, backgroundColor: 'transparent', color: '#ffffff', width: '100%' }}>
        <FormGrid container spacing={2}>
          {/* Action and Count in a Row */}
          <Grid container spacing={2} sx={{ margin: 0, width: '100%' }}>
            <Grid item xs={6} sx={{ padding: 0 }}>
              <FormGrid>
                <FormLabel
                  htmlFor="action"
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
                    displayEmpty
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
                  htmlFor="count"
                  className="title-form"
                  sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
                >
                  Count
                </FormLabel>
                <FormControl fullWidth variant="outlined">
                  <Select
                    id="count"
                    value={this.state.count}
                    onChange={this.handleSelectChange('count')}
                    sx={commonSelectStyle}
                    MenuProps={commonMenuProps}
                    displayEmpty
                  >
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                  </Select>
                </FormControl>
              </FormGrid>
            </Grid>
          </Grid>

          {/* Dmode Checkbox */}
          <Grid container spacing={2} sx={{ mt: 0.5, margin: 0, width: '100%' }}>
            <Grid item xs={3} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.dmode}
                    onChange={this.handleCheckboxChange('dmode')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>Dmode</Typography>}
              />
            </Grid>
          </Grid>

          {/* Centered Title for Mode Checkboxes */}
          <Grid container sx={{ mt: 0.5, margin: 0, width: '100%', paddingLeft: '16px' }}>
            <Typography sx={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }} className="title-form">
              Select at least one mode <span style={{ color: 'red' }}>*</span>:
            </Typography>
          </Grid>

          {/* Mode Checkboxes */}
          <Grid container spacing={2} sx={{ margin: 0, width: '100%' }}>
            <Grid item xs={4} sx={{ padding: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.machineMode}
                    onChange={this.handleCheckboxChange('machineMode')}
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }}
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
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }}
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
                    sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }}
                  />
                }
                label={<Typography sx={{ color: '#ffffff' }}>User mode</Typography>}
              />
            </Grid>
          </Grid>
        </FormGrid>
      </div>
    );
  }

  protected override onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    const buttonBar = document.querySelector('.theia-dialog-button-bar');
    if (buttonBar) {
      buttonBar.setAttribute('style', 'display: flex; flex-direction: row-reverse; justify-content: flex-end; gap: 8px;');
    }
    this.update();
  }

  @postConstruct()
  protected init(): void {
    this.title.label = 'Add Icount Trigger';
    this.state = { ...SecondStepIcount.persistedState };
    Object.assign(this.triggerConfig, this.toTriggerConfig());
    console.log('TriggerConfig:', this.triggerConfig);
  }

  public async openWithData(trigger: TriggerConfig, isEdit = false): Promise<TriggerConfig | undefined> {
    const defaultState: DialogState = {
      action: 'switch to debug mode',
      count: '1',
      dmode: false,
      machineMode: false,
      supervisorMode: false,
      userMode: false,
    };

    if (trigger.triggerType === 'icount' && trigger.tdata1.type === 3) {
      // tdata1 is ICount
      this.state = {
        action: trigger.tdata1.action || defaultState.action,
        count: trigger.tdata1.count ? trigger.tdata1.count.toString() : defaultState.count,
        dmode: trigger.tdata1.dmode || defaultState.dmode,
        machineMode: trigger.tdata1.m || defaultState.machineMode,
        supervisorMode: trigger.tdata1.s || defaultState.supervisorMode,
        userMode: trigger.tdata1.u || defaultState.userMode,
      };
    } else {
      this.state = defaultState;
    }

    SecondStepIcount.persistedState = { ...this.state };
    this.title.label = isEdit ? 'Edit Icount Trigger' : 'Add Icount Trigger';
    this.clearAcceptButton();
    this.appendAcceptButton(isEdit ? 'Edit Trigger' : 'Create Trigger');
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