import { MessageService } from '@theia/core';
import { DialogProps, Message } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';
import * as React from 'react';

import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

@injectable()
export class DemoDialogProps extends DialogProps {}

interface DialogState {
  sayhi: string;
  saylo: string;
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
export class DemoDialog extends ReactDialog<void> {
  @inject(MessageService)
  protected readonly messageService: MessageService;

  private static persistedState: DialogState = {
    sayhi: 'switch to debug mode',
    saylo: 'switch to debug mode',
    match: 'switch to debug mode',
    action: 'switch to debug mode',
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
  private debounceTimeout: NodeJS.Timeout | null = null;

  constructor(
    @inject(DialogProps) protected readonly props: DialogProps
  ) {
    super(props);
    this.state = { ...DemoDialog.persistedState };
    this.appendAcceptButton('Create Trigger');
    this.appendCloseButton('Back');

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  get value(): void {
    return;
  }

  private readonly handleSelectChange: (key: keyof DialogState) => (event: SelectChangeEvent) => void = (key) => (event) => {
    if (key === 'sayhi' || key === 'saylo' || key === 'match' || key === 'action' || key === 'matchControlType') {
      this.state = { ...this.state, [key]: event.target.value };
      DemoDialog.persistedState = { ...this.state };
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
      DemoDialog.persistedState = { ...this.state };
      this.update();
    }
  };

  private readonly handleTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void = (event) => {
    const newValue = event.target.value;
    this.state = { ...this.state, triggerData: newValue };

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      DemoDialog.persistedState = { ...this.state };
      this.update();
    }, 500);
  };

  protected render(): React.ReactNode {
    const loaderLine = document.getElementById('loader-line') as HTMLInputElement;
    if (loaderLine) {
      loaderLine.classList.remove('xplor-ide-loader-line');
    }

    const FormGrid = styled(Grid)(() => ({
      display: 'flex',
      flexDirection: 'column',
    }));

    return (
      <div style={{ padding: '16px', backgroundColor: '#1e2527', color: '#ffffff' }}>
        <FormGrid container spacing={2}>
          {/* Sayhi and Saylo */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ color: '#ffffff' }}>Sayhi</InputLabel>
                <Select
                  value={this.state.sayhi}
                  onChange={this.handleSelectChange('sayhi')}
                  sx={{
                    backgroundColor: '#2d3537',
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                    '& .MuiSelect-icon': { color: '#ffffff' },
                  }}
                >
                  <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                  <MenuItem value="switch to mode">switch to mode</MenuItem>
                  <MenuItem value="switch to debug">switch to debug</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ color: '#ffffff' }}>Saylo</InputLabel>
                <Select
                  value={this.state.saylo}
                  onChange={this.handleSelectChange('saylo')}
                  sx={{
                    backgroundColor: '#2d3537',
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                    '& .MuiSelect-icon': { color: '#ffffff' },
                  }}
                >
                  <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                  <MenuItem value="switch to mode">switch to mode</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Match and Action */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ color: '#ffffff' }}>Match</InputLabel>
                <Select
                  value={this.state.match}
                  onChange={this.handleSelectChange('match')}
                  sx={{
                    backgroundColor: '#2d3537',
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                    '& .MuiSelect-icon': { color: '#ffffff' },
                  }}
                >
                  <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                  <MenuItem value="switch to debug">switch to debug</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ color: '#ffffff' }}>Action</InputLabel>
                <Select
                  value={this.state.action}
                  onChange={this.handleSelectChange('action')}
                  sx={{
                    backgroundColor: '#2d3537',
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                    '& .MuiSelect-icon': { color: '#ffffff' },
                  }}
                >
                  <MenuItem value="switch to debug mode">switch to debug mode</MenuItem>
                  <MenuItem value="switch to debug">switch to debug</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Checkboxes */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Checkbox checked={this.state.dmode} onChange={this.handleCheckboxChange('dmode')} sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }} />}
                label={<Typography sx={{ color: '#ffffff' }}>Dmode</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={this.state.timing} onChange={this.handleCheckboxChange('timing')} sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }} />}
                label={<Typography sx={{ color: '#ffffff' }}>Timing</Typography>}
              />
              <Typography sx={{ color: '#ffffff', mt: 1 }}>Choose at least one mode:</Typography>
              <FormControlLabel
                control={<Checkbox checked={this.state.machineMode} onChange={this.handleCheckboxChange('machineMode')} sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }} />}
                label={<Typography sx={{ color: '#ffffff' }}>Machine mode</Typography>}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Checkbox checked={this.state.select} onChange={this.handleCheckboxChange('select')} sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }} />}
                label={<Typography sx={{ color: '#ffffff' }}>Select</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={this.state.chain} onChange={this.handleCheckboxChange('chain')} sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }} />}
                label={<Typography sx={{ color: '#ffffff' }}>Chain</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={this.state.supervisorMode} onChange={this.handleCheckboxChange('supervisorMode')} sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }} />}
                label={<Typography sx={{ color: '#ffffff' }}>Supervisor mode</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={this.state.userMode} onChange={this.handleCheckboxChange('userMode')} sx={{ color: '#ffffff', '&.Mui-checked': { color: '#f44336' } }} />}
                label={<Typography sx={{ color: '#ffffff' }}>User mode</Typography>}
              />
            </Grid>
          </Grid>

          {/* Match Control Type */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel sx={{ color: '#ffffff' }}>Choose match control type</InputLabel>
              <Select
                value={this.state.matchControlType}
                onChange={this.handleSelectChange('matchControlType')}
                sx={{
                  backgroundColor: '#2d3537',
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                  '& .MuiSelect-icon': { color: '#ffffff' },
                }}
              >
                <MenuItem value="">Select type</MenuItem>
                <MenuItem value="type1">Type 1</MenuItem>
                <MenuItem value="type2">Type 2</MenuItem>
                <MenuItem value="type3">Type 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Trigger Data */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography sx={{ color: '#ffffff', mb: 1 }}>Trigger Data 2</Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={this.state.triggerData}
              onChange={this.handleTextChange}
              placeholder="Enter Trigger data 2"
              sx={{
                '& .MuiInputBase-root': { backgroundColor: '#2d3537', color: '#ffffff' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
              }}
            />
          </Grid>
        </FormGrid>
      </div>
    );
  }

  protected override onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
  }

  @postConstruct()
  protected init(): void {
    this.title.label = 'Add Match Control Trigger';
    this.state = { ...DemoDialog.persistedState };
  }

  protected override async accept(): Promise<void> {
    this.messageService.info('Accepted');
    super.accept();
  }

  public override close(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    super.close();
  }
}
