import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { gameService, GameSession } from '../services/gameService';
import { getItem } from '../utils/storage';

const TicTacToe: React.FC = () => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);

  useEffect(() => {
    loadCurrentGame();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accessToken = await getItem('accessToken');
      const refreshToken = await getItem('refreshToken');
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const loadCurrentGame = async () => {
    try {
      setLoading(true);
      const response = await gameService.getCurrentGame();
      setGameSession(response.gameSession);
    } catch (error: any) {
      if (error.message.includes("No active game session")) {
        setGameSession(null);
      } else {
        showError("Failed to load game", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const startNewGame = async (isComputerFirst: boolean) => {
    try {
      setGameLoading(true);
      
      await gameService.startGame(isComputerFirst);
      console.log('Game started successfully');

      const response = await gameService.getCurrentGame();
      setGameSession(response.gameSession);

      showSuccess(
        "New game started!",
        `Game started with ${isComputerFirst ? "computer" : "you"} going first`
      );
    } catch (error: any) {
      console.error('Error starting new game:', error);
      showError("Failed to start new game", error.message);
    } finally {
      setGameLoading(false);
    }
  };

  const makeMove = async (row: number, col: number) => {
    if (!gameSession || gameSession.gameState.isOver) return;

    // Determine if it's user's turn based on currentPlayer
    // User is "O" when computer goes first, "X" when user goes first
    const isUserTurn =
      gameSession.currentPlayer === (gameSession.isComputerFirst ? "O" : "X");

    if (!isUserTurn) {
      showError(
        "Not your turn",
        "Please wait for the computer to make its move"
      );
      return;
    }

    try {
      setGameLoading(true);
      const response = await gameService.makeMove(row, col);
      setGameSession(response.gameSession);

      if (response.gameSession.gameState.isOver) {
        if (response.gameSession.gameState.winner) {
          showSuccess(
            "Game Over!",
            `Winner: ${response.gameSession.gameState.winner}`
          );
        } else if (response.gameSession.gameState.isDraw) {
          showSuccess("Game Over!", "It's a draw!");
        }
      }
    } catch (error: any) {
      showError("Invalid move", error.message);
    } finally {
      setGameLoading(false);
    }
  };

  const showSuccess = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const showError = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const renderCell = (value: string, row: number, col: number) => {
    if (!gameSession) return null;

    const isUserTurn =
      gameSession.currentPlayer === (gameSession.isComputerFirst ? "O" : "X");

    const isClickable =
      !gameSession.gameState.isOver && isUserTurn && value === "";

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          isClickable && styles.clickableCell,
          value === "X" && styles.xCell,
          value === "O" && styles.oCell,
        ]}
        onPress={() => isClickable && makeMove(row, col)}
        disabled={!isClickable}
      >
        <Text style={[
          styles.cellValue,
          value === "X" && styles.xValue,
          value === "O" && styles.oValue,
        ]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBoard = () => {
    if (!gameSession) return null;

    return (
      <View style={styles.board}>
        {gameSession.board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </View>
        ))}
      </View>
    );
  };

  const renderStartGameButtons = () => {
    if (gameSession && !gameSession.gameState.isOver) return null;

    return (
      <View style={styles.startGameSection}>
        <Text style={styles.sectionTitle}>Start New Game</Text>
        <View style={styles.startButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => startNewGame(false)}
            disabled={gameLoading}
          >
            {gameLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>User Goes First (X)</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => startNewGame(true)}
            disabled={gameLoading}
          >
            {gameLoading ? (
              <ActivityIndicator color="#1890ff" />
            ) : (
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Computer Goes First (X)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGameInfo = () => {
    if (!gameSession) return null;

    const isUserTurn =
      gameSession.currentPlayer === (gameSession.isComputerFirst ? "O" : "X");

    return (
      gameSession.gameState.isOver ?
      <View style={styles.gameInfo}>
          <Text style={styles.gameOverText}>
            {gameSession.gameState.winner 
              ? `Winner: ${gameSession.gameState.winner}`
              : "It's a draw!"
            }
          </Text>
      </View> : null
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.gameCard}>
        <View style={styles.header}>
          <Text style={styles.title}>Tic Tac Toe</Text>
        </View>

        {!gameSession &&renderStartGameButtons()}

        {gameSession && (
          <>
            {renderGameInfo()}
            {renderBoard()}

              <View style={styles.gameOverSection}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => setGameSession(null)}
                >
                  <Text style={styles.buttonText}>Start New Game</Text>
                </TouchableOpacity>
              </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  startGameSection: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  startButtons: {
    gap: 16,
    width: '100%',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#1890ff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1890ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1890ff',
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
  },
  gameInfoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  gameOverText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#52c41a',
    marginTop: 8,
  },
  board: {
    alignSelf: 'center',
    backgroundColor: '#e6f7ff',
    padding: 8,
    borderRadius: 12,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  clickableCell: {
    backgroundColor: '#f6ffed',
    borderColor: '#52c41a',
  },
  xCell: {
    backgroundColor: '#fff2e8',
    borderColor: '#ff7a45',
  },
  oCell: {
    backgroundColor: '#f6ffed',
    borderColor: '#52c41a',
  },
  cellValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  xValue: {
    color: '#ff7a45',
  },
  oValue: {
    color: '#52c41a',
  },
  gameOverSection: {
    alignItems: 'center',
  },
});

export default TicTacToe; 