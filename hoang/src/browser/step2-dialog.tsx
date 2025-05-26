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
    console.log('TriggerData:', event.target.value);
    this.setDialogState({ triggerData: event.target.value });
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

            {/* ✅ Maskmax */}
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
                      <MenuItem value="">Select Maskmax</MenuItem>
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
                      sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }}
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
                      sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }}
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
                      sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }}
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
                      sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }}
                    />
                  }
                  label={<Typography sx={{ color: '#ffffff' }}>Chain</Typography>}
                />
              </Grid>
            </Grid>

            {/* Centered Title between 2 checkbox rows */}
            <Grid container sx={{ mt: 0.5, margin: 0, width: '100%', paddingLeft: '16px' }}>
              <Typography sx={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }} className='title-form'>
                Choose at least one mode:
              </Typography>
            </Grid>

            {/* Checkboxes - Row 2 (3 items) */}
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


          {/* Match Control Type */}
          <Grid item xs={12} sx={{ mt: 1, padding: 0 }}>
          <FormGrid>
            <FormLabel
              htmlFor="trigger-name"
              className="title-form"
              required
              sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
            >
              Match control type
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
                <MenuItem value="type1">Type 1</MenuItem>
                <MenuItem value="type2">Type 2</MenuItem>
                <MenuItem value="type3">Type 3</MenuItem>
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
                required
                sx={{ color: '#ffffff', marginBottom: '3px', fontSize: '14px' }}
              >
                Trigger data 2
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
                placeholder="Enter Trigger data 2"
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