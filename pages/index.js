import { Button, Paper, Stack, TextField } from '@mui/material'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [primaryAddress, setPrimaryAddress] = useState('');
  const [allowance, setAllowance] = useState('0');
  const [endTime, setEndTime] = useState('');
  const [started, setStarted] = useState(false);
  const [guess, setGuess] = useState('');
  const [rows, setRows] = useState([]);
  useEffect(()=>{
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      router.push('/login');
    } else {
      fetch('/api/status', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },
        body: JSON.stringify({jwt})
      }).then(res=>res.json()).then(res=>{
        console.log('status', res);
        if (!res.success || !res.data.allowance || !res.data.endTime || (Number(res.data.allowance) === 0 || Number(res.data.endTime*1000) <= Date.now())) {
          router.push('/login');
        } else {
          localStorage.setItem('status', JSON.stringify(res.data));
          setUsername(res.data.username);
          setAllowance(res.data.allowance);
          setEndTime(res.data.endTime);
          setPrimaryAddress(res.data.primaryAddress);
          console.log('status', Number(res.data.endTime*1000) <= Date.now())
        }
      }).catch(err=>{
        console.error(err);
        router.push('/login');
      })
    }
  }, [router]);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Demo Game Guess Number</title>
        <meta name="description" content="Demo Game Guess Number" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Guess Number
        </h1>
        {
          !started && <Paper elevation={3} sx={{marginTop: '40px', padding: '20px'}} >
          <Stack spacing={2} direction="column">
            <p>Welcome {username} ~</p>
            Your current game allowance is {allowance} vZOO
            <p>Your play time left {((endTime - Date.now()/1000) / 60).toFixed(0)} mins</p>
            <u>Read Game Rules</u>
            <p></p>
            <Button variant='contained' onClick={()=>{
              fetch('/api/gameStart', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                  },
                body: JSON.stringify({
                  username: username,
                  primaryAddress: primaryAddress,
                })
              }).then(res=>res.json()).then(res=>{}).catch(err=>{});
              setStarted(true);
            }} >Start with 100 vZOO</Button>
          </Stack>
        </Paper>
        }
        {
          started && <Paper elevation={3} sx={{marginTop: '40px', padding: '20px'}} >
            <Stack spacing={2} direction="column">
              {/* <Stack spacing={2} direction="row">
                <div>Allowance: {allowance} vZOO</div>
                <p>Time Left {((endTime - Date.now()/1000) / 60).toFixed(0)} mins</p>
              </Stack> */}
              <Paper elevation={10} sx={{padding: '20px', textAlign: 'center'}} >
                <span>Prize</span>
                <span style={{margin: '10px', border: '1px solid white', fontSize:'30px', borderRadius: '50%', padding: '20px'}}>200</span>
                <span>vZOO</span>
              </Paper>
              <Stack spacing={3} direction="row">
                <Paper elevation={10} sx={{padding: '20px', fontSize:'40px'}} >?</Paper>
                <Paper elevation={10} sx={{padding: '20px', fontSize:'40px'}} >?</Paper>
                <Paper elevation={10} sx={{padding: '20px', fontSize:'40px'}} >?</Paper>
                <Paper elevation={10} sx={{padding: '20px', fontSize:'40px'}} >?</Paper>
              </Stack>
              <Paper fullWidth sx={{textAlign:'center'}} >Input the Number you guess with 10 $vZOO</Paper>
              <Stack spacing={3} direction="row">
                <TextField label="Four Numbers" fullWidth variant="outlined" type="number" value={guess} onChange={(e)=>{
                  if (e.target.value.length <= 4) {
                    setGuess(e.target.value);
                  }
                }} />
                <Button variant='contained' >Go</Button>
              </Stack>
              <Paper fullWidth sx={{textAlign:'center'}}>You left 10 times</Paper>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Round</TableCell>
                    <TableCell align="center">Number</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.round}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.number}
                      </TableCell>
                      <TableCell align="right">{row.status}</TableCell>
                      <TableCell align="right">{row.result}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </Stack>
        </Paper>
        }
        
      </main>
    </div>
  )
}
