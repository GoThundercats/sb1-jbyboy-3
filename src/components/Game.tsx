import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../utils/types';
import { initializeDeck, shuffleDeck, haul, performBargain, performFleaHop, performDevilHop, performWalkyTalky, performZonkOut, performHangout, performEasyGo } from '../utils/gameLogic';
import Card from './Card';
import RulesModal from './RulesModal';
import RulesReference from './RulesReference';

const Game: React.FC = () => {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [market, setMarket] = useState<CardType[]>([]);
  const [bankroll, setBankroll] = useState<CardType[]>([]);
  const [easyGo, setEasyGo] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [money, setMoney] = useState(10);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [message, setMessage] = useState('');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const newDeck = initializeDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setDeck(shuffledDeck);
    setMarket(shuffledDeck);
    setBankroll([]);
    setEasyGo([]);
    setSelectedCards([]);
    setMoney(10);
    setMessage('New round started. Select a move to begin.');
  };

  const handleCardClick = (card: CardType) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleHaul = () => {
    const result = haul(market, selectedCards);
    if (result.success) {
      setMarket(result.newMarket);
      setBankroll([...bankroll, ...selectedCards]);
      setSelectedCards([]);
      setMessage('Haul successful!');
    } else {
      setMessage('Invalid Haul. Select adjacent cards of the same rank.');
    }
  };

  const handleBargain = () => {
    if (selectedCards.length !== 2 || money < 1) {
      setMessage('Select exactly two adjacent cards and ensure you have enough money.');
      return;
    }
    const result = performBargain(market, selectedCards[0], selectedCards[1]);
    if (result.success) {
      setMarket(result.newMarket);
      setMoney(money - 1);
      setSelectedCards([]);
      setMessage('Bargain successful!');
    } else {
      setMessage('Invalid Bargain. Select two adjacent cards.');
    }
  };

  const handleFleaHop = () => {
    if (selectedCards.length !== 2) {
      setMessage('Select exactly two cards of the same suit.');
      return;
    }
    const result = performFleaHop(market, selectedCards[0], selectedCards[1]);
    if (result.success) {
      setMarket(result.newMarket);
      setSelectedCards([]);
      setMessage('Flea Hop successful!');
    } else {
      setMessage('Invalid Flea Hop. Select two cards of the same suit.');
    }
  };

  const handleDevilHop = () => {
    if (selectedCards.length !== 4 || money < 3) {
      setMessage('Select exactly four cards (one of each suit) and ensure you have enough money.');
      return;
    }
    const result = performDevilHop(market, selectedCards);
    if (result.success) {
      setMarket(result.newMarket);
      setMoney(money - 3);
      setSelectedCards([]);
      setMessage('Devil Hop successful!');
    } else {
      setMessage('Invalid Devil Hop. Select one card of each suit.');
    }
  };

  const handleWalkyTalky = () => {
    if (selectedCards.length !== 3 || money < 3) {
      setMessage('Select exactly three cards in a run and ensure you have enough money.');
      return;
    }
    const result = performWalkyTalky(market, selectedCards);
    if (result.success) {
      setMarket(result.newMarket);
      setMoney(money - 3);
      setSelectedCards([]);
      setMessage('Walky Talky successful!');
    } else {
      setMessage('Invalid Walky Talky. Select three cards in a run.');
    }
  };

  const handleZonkOut = () => {
    if (selectedCards.length !== 2) {
      setMessage('Select exactly two adjacent Zonkers or a Zonker and a Parking Lot.');
      return;
    }
    const result = performZonkOut(market, selectedCards);
    if (result.success) {
      setMarket(result.newMarket);
      setEasyGo([...easyGo, ...result.removedCards]);
      setSelectedCards([]);
      setMessage('Zonk Out successful!');
    } else {
      setMessage('Invalid Zonk Out. Select adjacent Zonkers or a Zonker and a Parking Lot.');
    }
  };

  const handleHangout = () => {
    const result = performHangout(market, selectedCards);
    if (result.success) {
      setMarket(result.newMarket);
      setEasyGo([...easyGo, ...result.removedCards]);
      setSelectedCards([]);
      setMessage('Hangout successful!');
    } else {
      setMessage('Invalid Hangout. Select a Parking Lot and its adjacent matching cards.');
    }
  };

  const handleEasyGo = () => {
    if (selectedCards.length !== 2 || money < 1) {
      setMessage('Select exactly two adjacent cards of the same suit and ensure you have enough money.');
      return;
    }
    const result = performEasyGo(market, selectedCards);
    if (result.success) {
      setMarket(result.newMarket);
      setEasyGo([...easyGo, ...selectedCards]);
      setMoney(money - 1);
      setSelectedCards([]);
      setMessage('Easy Go successful!');
    } else {
      setMessage('Invalid Easy Go. Cards must be adjacent and of the same suit.');
    }
  };

  return (
    <div className="game-container">
      <h1 className="text-3xl font-bold mb-4">Flea Devil Solitaire</h1>
      <div className="game-info">
        <p>Money: ${money} | Score: {score} | Strikes: {strikes}</p>
      </div>
      <div className="message">{message}</div>
      <div className="game-areas">
        <div className="bankroll-area">
          <h2 className="text-xl font-bold mb-2">Bankroll</h2>
          <p>{bankroll.length} cards</p>
        </div>
        <div className="market-area">
          <h2 className="text-xl font-bold mb-2">Market</h2>
          <div className="card-grid">
            {market.map((card, index) => (
              <Card
                key={index}
                card={card}
                onClick={() => handleCardClick(card)}
                selected={selectedCards.includes(card)}
              />
            ))}
          </div>
        </div>
        <div className="easy-go-area">
          <h2 className="text-xl font-bold mb-2">Easy Go</h2>
          <p>{easyGo.length} cards</p>
        </div>
      </div>
      <div className="controls">
        <button onClick={handleHaul}>Haul</button>
        <button onClick={handleBargain}>Bargain ($1)</button>
        <button onClick={handleFleaHop}>Flea Hop</button>
        <button onClick={handleDevilHop}>Devil Hop ($3)</button>
        <button onClick={handleWalkyTalky}>Walky Talky ($3)</button>
        <button onClick={handleZonkOut}>Zonk Out</button>
        <button onClick={handleHangout}>Hangout</button>
        <button onClick={handleEasyGo}>Easy Go ($1)</button>
        <button onClick={() => setIsRulesOpen(true)}>Rules</button>
      </div>
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <RulesReference />
    </div>
  );
};

export default Game;