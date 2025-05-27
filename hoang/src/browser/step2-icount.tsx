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
import { MControl, TriggerConfig } from './common/trigger-interface';
import { UUID } from '@theia/core/shared/@lumino/coreutils';

@injectable()
export class SecondStepIcountProps extends DialogProps {}

interface DialogState {
  action: string;
  dmode: boolean;
  machineMode: boolean;
  supervisorMode: boolean;
  userMode: boolean;
}

@injectable()
export class SecondStepIcount extends ReactDialog<TriggerConfig> {
  @inject(MessageService)
  protected readonly messageService: MessageService;

  private setDialogState(partialState: Partial<DialogState>, shouldUpdate = false) {
    this.state = { ...this.state, ...partialState };
    SecondStepIcount.persistedState = { ...this.state };
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
      mcontrolType: '', // No matchControlType field, set empty
      tdata1: {
        action: this.state.action,
        match: '', // No match field, set empty
        sizehi: '', // No sizehi field, set empty
        sizelo: '', // No sizelo field, set empty
        maskmax: '', // No maskmax field, set empty
        dmode: this.state.dmode,
        timing: false, // No timing field, set false
        select: false, // No select field, set false
        chain: false, // No chain field, set false
        m: this.state.machineMode,
        s: this.state.supervisorMode,
        u: this.state.userMode,
      } as MControl,
      tdata2: undefined, // No triggerData field
    };
  }

  private static persistedState: DialogState = {
    action: 'switch to debug mode',
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
    this.appendAcceptButton('Create Trigger');
    this.appendCloseButton('Back');

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  get value(): TriggerConfig {
    return this.toTriggerConfig();
  }

  private readonly handleSelectChange: (key: keyof DialogState) => (event: SelectChangeEvent) => void = (key) => (event) => {
    if (key === 'action') {
      this.setDialogState({ [key]: event.target.value }, true);
    }
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

    return (
      <div style={{ padding: 0, paddingLeft: -16, backgroundColor: 'none', color: '#ffffff', width: '100%' }}>
        <FormGrid container spacing={2}>
          {/* Action */}
          <Grid item xs={12} sx={{ padding: 0 }}>
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
                >
                  <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                  <MenuItem value="switch to debug">switch to debug</MenuItem>
                </Select>
              </FormControl>
            </FormGrid>
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
            <Typography sx={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }} className='title-form'>
              Choose at least one mode:
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
    this.update();
  }

  @postConstruct()
  protected init(): void {
    this.title.label = 'Add Match Control Trigger';
    this.state = { ...SecondStepIcount.persistedState };
    Object.assign(this.triggerConfig, this.toTriggerConfig());
    console.log('TriggerConfig:', this.triggerConfig);
  }

  protected override async accept(): Promise<void> {
    this.messageService.info('Accepted');
    Object.assign(this.triggerConfig, this.toTriggerConfig());
    console.log('TriggerConfig:', this.triggerConfig);
    super.accept();
  }

  public override close(): void {
    super.close();
  }
}