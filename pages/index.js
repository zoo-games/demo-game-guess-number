import { Button, Paper, Stack, TextField } from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { LoadingButton } from "@mui/lab";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [primaryAddress, setPrimaryAddress] = useState("");
  const [allowance, setAllowance] = useState("0");
  const [endTime, setEndTime] = useState("");
  const [started, setStarted] = useState(false);
  const [guess, setGuess] = useState("");
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/login");
    } else {
      fetch("/api/status", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("status", res);
          if (
            !res.success ||
            !res.data.allowance ||
            !res.data.endTime ||
            Number(res.data.allowance) === 0 ||
            Number(res.data.endTime * 1000) <= Date.now()
          ) {
            router.push("/login");
          } else {
            localStorage.setItem("status", JSON.stringify(res.data));
            setUsername(res.data.username);
            setAllowance(res.data.allowance);
            setEndTime(res.data.endTime);
            setPrimaryAddress(res.data.primaryAddress);
            console.log(
              "status",
              Number(res.data.endTime * 1000) <= Date.now()
            );
          }
        })
        .catch((err) => {
          console.error(err);
          router.push("/login");
        });
    }
  }, [router]);
  const [key, setKey] = useState("");
  const [roundId, setRoundId] = useState("");
  const [loading, setLoading] = useState(false);
  const [guessRound, setGuessRound] = useState(0);
  const [history, setHistory] = useState([]);
  const [winned, setWinned] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [random, setRandom] = useState('');

  return (
    <div className={styles.container}>
      <Head>
        <title>Demo Game Guess Number</title>
        <meta name="description" content="Demo Game Guess Number" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Guess Number</h1>
        {!started && (
          <Paper elevation={3} sx={{ marginTop: "40px", padding: "20px" }}>
            {endTime - Date.now() / 1000 > 0 && (
              <Stack spacing={2} direction="column">
                <p>Welcome {username} ~</p>
                Your current game allowance is {allowance} vZOO
                <p>
                  Your play time left{" "}
                  {((endTime - Date.now() / 1000) / 60).toFixed(0)} mins
                </p>
                {/* <u>Read Game Rules</u> */}
                <p></p>
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  sx={{ textTransform: "none" }}
                  onClick={() => {
                    setLoading(true);
                    const jwt = localStorage.getItem("jwt");
                    fetch("/api/gameStart", {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        username: username,
                        primaryAddress: primaryAddress,
                        jwt,
                      }),
                    })
                      .then((res) => res.json())
                      .then((res) => {
                        console.log("res", res);
                        if (res.success) {
                          setKey(res.data.id);
                          setRoundId(res.data.roundId);
                          setStarted(true);
                        }
                      })
                      .catch(console.error)
                      .finally(() => {
                        setLoading(false);
                        setRandom('');
                      });
                  }}
                >
                  Start Game (10 $vZOO)
                </LoadingButton>
              </Stack>
            )}
            {endTime - Date.now() / 1000 <= 0 && "Loading..."}
          </Paper>
        )}
        {started && (
          <Paper elevation={3} sx={{ marginTop: "40px", padding: "20px" }}>
            <Stack spacing={2} direction="column">
              {/* <Stack spacing={2} direction="row">
                <div>Allowance: {allowance} vZOO</div>
                <Button>Logout</Button>
              </Stack> */}
              <Paper
                elevation={10}
                sx={{ padding: "20px", textAlign: "center" }}
              >
                <span>Prize</span>
                <span
                  style={{
                    margin: "10px",
                    border: "1px solid white",
                    fontSize: "30px",
                    borderRadius: "50%",
                    padding: "20px",
                  }}
                >
                  {20 - guessRound}
                </span>
                <span>vZOO</span>
              </Paper>
              <Stack spacing={3} direction="row">
                <Paper
                  elevation={10}
                  sx={{ padding: "20px", fontSize: "40px" }}
                >
                  ?
                </Paper>
                <Paper
                  elevation={10}
                  sx={{ padding: "20px", fontSize: "40px" }}
                >
                  ?
                </Paper>
                <Paper
                  elevation={10}
                  sx={{ padding: "20px", fontSize: "40px" }}
                >
                  ?
                </Paper>
                <Paper
                  elevation={10}
                  sx={{ padding: "20px", fontSize: "40px" }}
                >
                  ?
                </Paper>
              </Stack>
              {!gameOver && (
                <>
                  <Paper sx={{ textAlign: "center" }}>
                    Input the Number you guess:
                  </Paper>
                  <Stack spacing={3} direction="row">
                    <TextField
                      label="Four Numbers"
                      fullWidth
                      variant="outlined"
                      type="number"
                      value={guess}
                      onChange={(e) => {
                        if (e.target.value.length <= 4) {
                          setGuess(e.target.value);
                        }
                      }}
                    />
                    <LoadingButton
                      loading={loading}
                      variant="contained"
                      onClick={() => {
                        setLoading(true);
                        fetch("/api/guess", {
                          method: "POST",
                          headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            username: username,
                            primaryAddress: primaryAddress,
                            guess,
                            key,
                            roundId,
                            guessRound,
                          }),
                        })
                          .then((res) => res.json())
                          .then((res) => {
                            console.log("res", res);
                            if (res.success) {
                              setGuessRound(guessRound + 1);
                              setGuess("");
                              setHistory((pre) => {
                                return [...pre, res.data.history];
                              });
                              if (res.data.gameOver) {
                                setGameOver(true);
                                setRandom(res.data.random);
                              }
                              if (res.data.winned) {
                                setWinned(true);
                              }
                            }
                          })
                          .catch(console.error)
                          .finally(() => {
                            setLoading(false);
                          });
                      }}
                    >
                      Go
                    </LoadingButton>
                  </Stack>
                  <Paper sx={{ textAlign: "center" }}>
                    You left {10 - guessRound} times
                  </Paper>
                </>
              )}
              {
                gameOver && !winned && <Paper sx={{ textAlign: "center", fontSize: '40px' }}>
                  <p>You Losed !!</p>
                  <p>{random}</p>
                  <Button onClick={()=>{
                    setStarted(false);
                  }}>Return</Button>
                </Paper>
              }
              {
                gameOver && winned && <Paper sx={{ textAlign: "center", fontSize: '40px' }}>
                  <p>You Win !!</p>
                  <p>{random}</p>
                  <Button onClick={()=>{
                    setStarted(false);
                  }}>Return</Button>
                </Paper>
              }

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
                  {history.map((row, i) => (
                    <TableRow
                      key={i}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.round}
                      </TableCell>
                      <TableCell align="center">{row.number}</TableCell>
                      <TableCell align="center">{row.status}</TableCell>
                      <TableCell align="right">{row.result}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Paper>
        )}
      </main>
    </div>
  );
}
