// import { MessageService } from '@theia/core';
// import { DialogProps, Message } from '@theia/core/lib/browser';
// import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
// import { inject, injectable, postConstruct } from '@theia/core/shared/inversify';

// import FormLabel from '@mui/material/FormLabel';
// import Grid from '@mui/material/Grid';
// import OutlinedInput from '@mui/material/OutlinedInput';
// import { styled } from '@mui/material/styles';
// import * as React from 'react';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select, { SelectChangeEvent } from '@mui/material/Select';


// @injectable()
// export class DemoDialogProps extends DialogProps {
// }

// @injectable()
// export class DemoDialog extends ReactDialog<void> {
        
//         state: { age: string } = {
//                 age: '',
//             };

//         @inject(MessageService)
//         protected readonly messageService: MessageService;

//         constructor(
//                 @inject(DialogProps) protected readonly props: DialogProps
//         ) {
//                 super(props);
//                 this.appendAcceptButton('Create');
//                 this.appendCloseButton('Cancel');
//                 this.handleChange = this.handleChange.bind(this);
//         }

//         get value(): void {
//                 return;
//         }
//         protected handleChange(event: SelectChangeEvent) {
//                 this.state.age = event.target.value;
//                 this.update();
//               }
     

//         protected render(): React.ReactNode {

//                 const loaderLine = document.getElementById('loader-line') as HTMLInputElement;
//                 if (loaderLine) {
//                         loaderLine.classList.remove('xplor-ide-loader-line');
//                 }
//                 const FormGrid = styled(Grid)(() => ({
//                         display: 'flex',
//                         flexDirection: 'column',

//                 }));

//                 return (
//                         <div className="xplor-ide-dialog xplor-ide-grid-container" style={{ minWidth: '500px', padding: '30px', paddingRight: '5px' }} id='xplor-ide-create-project-dialog'>
//                                 <Grid container spacing={3} flexDirection={'column'} >
//                                 <FormGrid>
//                                         <FormLabel htmlFor="first-name" className="title-form" required>
//                                         Trigger name
//                                         </FormLabel>
//                                         <OutlinedInput
//                                         id="first-name"
//                                         name="first-name"
//                                         type="name"
//                                         placeholder="Enter trigger name"
//                                         autoComplete="first name"
//                                         required
//                                         size="small"
//                                         className="input-text"
//                                         />
//                                 </FormGrid>
//                                 <FormGrid>
//                                         <FormLabel htmlFor="first-name" className="title-form" required>
//                                         Trigger type
//                                         </FormLabel>
//                                         <OutlinedInput
//                                         id="first-name"
//                                         name="first-name"
//                                         type="name"
//                                         placeholder="John"
//                                         autoComplete="first name"
//                                         required
//                                         size="small"
//                                         className="input-text"
//                                         />
//                                 </FormGrid>
//                                 <FormControl fullWidth>
//                                         <InputLabel id="demo-label">Choose trigger type</InputLabel>
//                                         <Select
//                                         labelId="demo-label"
//                                         value={this.state.age}
//                                         label="Choose trigger type"
//                                         onChange={this.handleChange}
//                                         >
//                                         <MenuItem className="menu-item" value={10}>Ten</MenuItem>
//                                         <MenuItem value={20}>Twenty</MenuItem>
//                                         <MenuItem value={30}>Thirty</MenuItem>
//                                         </Select>
//                                 </FormControl>
//                                 </Grid>
                                        

//                         </div>
                        
//                 );
//         }




//         protected override onAfterAttach(msg: Message): void {
//                 super.onAfterAttach(msg);
//                 this.update();
//         }

//         @postConstruct()
//         protected init(): void {
//                 this.title.label = 'Create a new project';
//                 this.update();
//         }

//         protected override async accept(): Promise<void> {
//                 this.messageService.info('Accepted');
//                 super.accept();
//         }

// }
