

'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  AlertTitle,
  Chip,
  Card,
  CardContent,
  Divider,
  Fade,
  Grow,
  Stack,
  alpha
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  GridOn as GridOnIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ====================== Type Definitions ======================
type MatrixOperation = 'sum' | 'multiply' | 'result';

interface Matrix {
  id: string;
  name: string;
  data: number[][];
  rows: number;
  columns: number;
  type: MatrixOperation;
}


interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface InputControlsProps {
  rows: number;
  columns: number;
  onRowsChange: (value: number) => void;
  onColumnsChange: (value: number) => void;
  onGenerate: () => void;
  onReset: () => void;
  hasMatrices: boolean;
  loading: boolean;
}

interface MatrixTableProps {
  matrix: Matrix;
  isResult?: boolean;
  title: string;
}

// ====================== Styled Components ======================
interface StyledTableCellProps {
  isResult?: boolean;
  theme?: any;
}

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'isResult',
})<StyledTableCellProps>(({ theme, isResult }) => ({
  border: `2px solid ${theme.palette.divider}`,
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '0.9rem',
  padding: theme.spacing(1),
  minWidth: '48px',
  height: '48px',
  backgroundColor: isResult 
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.primary.main, 0.05),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: isResult 
      ? alpha(theme.palette.success.main, 0.2)
      : alpha(theme.palette.primary.main, 0.1),
    transform: 'scale(1.05)',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
}));

interface GradientButtonProps {
  variant?: 'primary' | 'success' | string;
}

const GradientButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<GradientButtonProps>(({ theme, variant }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease-in-out',
  ...(variant === 'primary' && {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[6],
    },
  }),
  ...(variant === 'success' && {
    background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.light} 90%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)`,
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[6],
    },
  }),
}));

// ====================== Matrix Utilities ======================
const MatrixUtils = {
  generateMatrix: (rows: number, cols: number, type: 'sum' | 'multiply'): number[][] => {
    const matrix: number[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        const value = type === 'sum' ? i + j : i * j;
        row.push(value);
      }
      matrix.push(row);
    }
    return matrix;
  },

  addMatrices: (matrix1: number[][], matrix2: number[][]): number[][] => {
    const rows = matrix1.length;
    const cols = matrix1[0].length;
    const result: number[][] = [];
    
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(matrix1[i][j] + matrix2[i][j]);
      }
      result.push(row);
    }
    return result;
  },

  validateDimensions: (rows: number, columns: number): ValidationResult => {
    if (!rows || !columns) {
      return { isValid: false, error: 'Both rows and columns are required' };
    }
    if (rows < 1 || rows > 10) {
      return { isValid: false, error: 'Rows must be between 1 and 10' };
    }
    if (columns < 1 || columns > 10) {
      return { isValid: false, error: 'Columns must be between 1 and 10' };
    }
    return { isValid: true };
  }
};

// ====================== Matrix Table Component ======================
const MatrixTable: React.FC<MatrixTableProps> = React.memo(({ 
  matrix, 
  isResult = false, 
  title 
}) => {
  return (
    <Fade in timeout={500}>
      <Card 
        sx={{ 
          height: '100%',
          background: isResult 
            ? (theme) => `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`
            : (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          border: isResult ? '2px solid' : '1px solid',
          borderColor: isResult ? 'success.main' : 'divider',
        }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <GridOnIcon color={isResult ? 'success' : 'primary'} />
            <Typography 
              variant="h6" 
              component="h3"
              color={isResult ? 'success.main' : 'primary.main'}
              fontWeight="bold"
            >
              {title}
            </Typography>
          </Stack>
          
          <TableContainer component={Paper} elevation={2}>
            <Table size="small">
              <TableBody>
                {matrix.data.map((row, rowIndex) => (
                  <TableRow key={`row-${rowIndex}`}>
                    {row.map((cell, colIndex) => (
                      <StyledTableCell 
                        key={`cell-${rowIndex}-${colIndex}`}
                        isResult={isResult}
                      >
                        {cell}
                      </StyledTableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Chip 
              label={`${matrix.rows} × ${matrix.columns}`}
              size="small"
              color={isResult ? 'success' : 'primary'}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
});

MatrixTable.displayName = 'MatrixTable';


const InputControls: React.FC<InputControlsProps> = React.memo(function InputControls({ 
  rows, 
  columns, 
  onRowsChange, 
  onColumnsChange, 
  onGenerate, 
  onReset, 
  hasMatrices, 
  loading 
}) {
  return (
    <StyledPaper>
      <Typography variant="h5" component="h2" gutterBottom color="primary.main" fontWeight="bold">
        Matrix Configuration
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Rows"
            type="number"
            value={rows}
            onChange={(e) => onRowsChange(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
            variant="outlined"
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Columns"
            type="number"
            value={columns}
            onChange={(e) => onColumnsChange(parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
            variant="outlined"
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <GradientButton
            variant="primary"
            onClick={onGenerate}
            disabled={loading}
            startIcon={<CalculateIcon />}
            fullWidth
            size="large"
          >
            {loading ? 'Generating...' : 'Generate Matrices'}
          </GradientButton>
        </Grid>
        
        {hasMatrices && (
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              onClick={onReset}
              startIcon={<RefreshIcon />}
              fullWidth
              size="large"
              sx={{ borderRadius: 3, fontWeight: 600 }}
            >
              Reset
            </Button>
          </Grid>
        )}
      </Grid>
    </StyledPaper>
  );
});
InputControls.displayName = 'InputControls'









// ====================== Instructions Component ======================
const Instructions = React.memo(() => (
  <Grow in timeout={800}>
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <InfoIcon color="info" />
          <Typography variant="h5" component="h2" color="info.main" fontWeight="bold">
            How to Use This Calculator
          </Typography>
        </Stack>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Matrix Generation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Enter desired rows and columns (1-10 each)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Click &quot;Generate Matrices&quot; to create two matrices
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>Sum Matrix:</strong> Each cell value = row index + column index
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Product Matrix:</strong> Each cell value = row index × column index
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Matrix Operations
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • After generation, use &quot;Add Matrices&quot; to combine them
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Result shows element-wise addition of both matrices
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Use &quot;Reset&quot; to clear all matrices and start over
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Hover over matrix cells to see interactive effects
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </Grow>
));

Instructions.displayName = 'Instructions';

// ====================== Main Matrix Calculator Component ======================
const MatrixCalculator: React.FC = () => {
  // State management with proper typing
  const [rows, setRows] = useState<number>(3);
  const [columns, setColumns] = useState<number>(3);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [resultMatrix, setResultMatrix] = useState<Matrix | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Memoized computation for checking if matrices exist
  const hasMatrices = useMemo(() => matrices.length > 0, [matrices]);

  // Handle matrix generation with validation and loading states
  const handleGenerate = useCallback(async () => {
    setError('');
    const validation = MatrixUtils.validateDimensions(rows, columns);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sumMatrix = MatrixUtils.generateMatrix(rows, columns, 'sum');
      const multiplyMatrix = MatrixUtils.generateMatrix(rows, columns, 'multiply');
      
      const newMatrices: Matrix[] = [
        {
          id: `sum-${Date.now()}`,
          name: 'Sum Matrix (i + j)',
          data: sumMatrix,
          rows,
          columns,
          type: 'sum'
        },
        {
          id: `multiply-${Date.now()}`,
          name: 'Product Matrix (i × j)',
          data: multiplyMatrix,
          rows,
          columns,
          type: 'multiply'
        }
      ];
      
      setMatrices(newMatrices);
      setResultMatrix(null);
    } catch {
      setError('Failed to generate matrices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [rows, columns]);

  // Handle matrix addition with error handling
  const handleAddMatrices = useCallback(() => {
    try {
      if (matrices.length !== 2) {
        setError('Need exactly 2 matrices to perform addition');
        return;
      }

      const [matrix1, matrix2] = matrices;
      
      if (matrix1.rows !== matrix2.rows || matrix1.columns !== matrix2.columns) {
        setError('Matrices must have identical dimensions for addition');
        return;
      }

      const resultData = MatrixUtils.addMatrices(matrix1.data, matrix2.data);
      
      const result: Matrix = {
        id: `result-${Date.now()}`,
        name: 'Sum + Product Matrix',
        data: resultData,
        rows: matrix1.rows,
        columns: matrix1.columns,
        type: 'result'
      };

      setResultMatrix(result);
      setError('');
    } catch  {
      setError('Failed to add matrices. Please try again.');
    }
  }, [matrices]);

  // Reset all matrices and clear errors
  const handleReset = useCallback(() => {
    setMatrices([]);
    setResultMatrix(null);
    setError('');
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 50%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
             Matrix Calculator
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            This Single Page Application is build by Ajmot at Webskitters Academy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Built with Next & Material-UI following modern development practices.
          </Typography>
        </Box>

        {/* Error Display */}
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Input Controls */}
        <InputControls
          rows={rows}
          columns={columns}
          onRowsChange={setRows}
          onColumnsChange={setColumns}
          onGenerate={handleGenerate}
          onReset={handleReset}
          hasMatrices={hasMatrices}
          loading={loading}
        />

        {/* Generated Matrices Display */}
        {hasMatrices && (
          <Fade in timeout={600}>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h4" component="h2" textAlign="center" gutterBottom color="primary.main" fontWeight="bold">
                Generated Matrices
              </Typography>
              
              <Grid container spacing={4} sx={{ mb: 4 }}>
                {matrices.map((matrix) => (
                  <Grid item xs={12} lg={6} key={matrix.id}>
                    <MatrixTable 
                      matrix={matrix} 
                      title={matrix.name}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {/* Matrix Addition Button */}
              <Box textAlign="center">
                <GradientButton
                  variant="success"
                  onClick={handleAddMatrices}
                  startIcon={<AddIcon />}
                  size="large"
                  sx={{ px: 4, py: 2, fontSize: '1.1rem' }}
                >
                  Add Matrices Together
                </GradientButton>
              </Box>
            </Box>
          </Fade>
        )}

        {/* Result Matrix Display */}
        {resultMatrix && (
          <Grow in timeout={800}>
            <Box sx={{ mt: 6 }}>
              <Typography variant="h4" component="h2" textAlign="center" gutterBottom color="success.main" fontWeight="bold">
                Matrix Addition Result
              </Typography>
              <Typography variant="subtitle1" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
                Element-wise addition of Sum Matrix and Product Matrix
              </Typography>
              
              <Box display="flex" justifyContent="center">
                <Box maxWidth="600px" width="100%">
                  <MatrixTable 
                    matrix={resultMatrix} 
                    title={resultMatrix.name}
                    isResult={true}
                  />
                </Box>
              </Box>
            </Box>
          </Grow>
        )}

        {/* Instructions */}
        {!hasMatrices && <Instructions />}

        {/* Footer */}
        <Box textAlign="center" sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Matrix Calculator © 2025 | Built with React, Material-UI, and modern development practices
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MatrixCalculator;



