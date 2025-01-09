import { Box, Button, Paper, Typography } from '@mui/material';
import { useState } from 'react';

const CCompiler = () => {
    const [code, setCode] = useState<string>('');
    const [output, setOutput] = useState<string>('');

    const handleCompile = async () => {
        // TODO: Implement compilation logic
        try {
            // This is a placeholder. You'll need to connect this to your backend
            setOutput('Compilation result will appear here');
        } catch (error) {
            setOutput('Error during compilation');
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Paper elevation={3} sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    C Code Editor
                </Typography>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{
                        width: '100%',
                        height: 'calc(100% - 80px)',
                        fontFamily: 'monospace',
                        padding: '8px',
                        resize: 'none',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                    placeholder="Write your C code here..."
                />
                <Button 
                    variant="contained" 
                    onClick={handleCompile}
                    sx={{ mt: 1 }}
                >
                    Compile & Run
                </Button>
            </Paper>
            
            <Paper elevation={3} sx={{ flex: 0.5, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Output
                </Typography>
                <Box
                    sx={{
                        backgroundColor: '#f5f5f5',
                        p: 2,
                        height: 'calc(100% - 60px)',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {output || 'Compilation output will appear here...'}
                </Box>
            </Paper>
        </Box>
    );
};

export default CCompiler; 