import React from "react";
import App from "./App";

function App() {
return (
  <div className="App">
    <h1>Help Desk</h1>
    <button onClick={TicketNotes}>Add Note</button>
    <button onClick={ticketDetails}>View Details</button>
      {ticketDetails && ( // render ticket details if ticketDetails is not null
        <div>
          <p>Title: {ticketDetails.title}</p>
          <p>Issue: {ticketDetails.issue}</p>
          <p>Description: {ticketDetails.description}</p>
          <p>Difficulty: {ticketDetails.difficulty}</p>
          <p>Device Type: {ticketDetails.deviceType}</p>
        </div>
      )}
    {!web3 ? (
      <button onClick={connectWallet}>Connect Wallet</button>
    ) : (
      <>
        <p>Your account: {account}</p>
        <form onSubmit={(e) => { e.preventDefault(); createTicket(title, issue, description, difficulty, deviceType); }}>
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Issue:
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              required
            ></textarea>
          </label>
          <br />
          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </label>
          <br />
          <label>
            Difficulty:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              required
            >
              <option value="">Select a difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>
          <br />
          <label>
            Device Type:
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              required
            >
              <option value="">Select a device type</option>
              <option value="Desktop">Desktop</option>
              <option value="Laptop">Laptop</option>
              <option value="Mobile">Mobile</option>
            </select>
          </label>
          <br />
          <button type="submit">Create Ticket</button>
        </form>
        <h2>Ticket Count: {ticketCount}</h2>
        <h2>Resolved Tickets</h2>
        <ul>
          {resolvedTickets.map((ticket, index) => (
            <li key={index}>
              <p>{ticket.title}</p>
              <p>{ticket.issue}</p>
              <p>{ticket.resolvedBy}</p>
            </li>
          ))}
        </ul>
        <h2>Open Tickets</h2>
        <ul>
          {Array.from({ length: ticketCount }, (_, i) => i).map((i) => {
            const ticket = contract.methods.tickets(i).call();
            if (!ticket.resolved) {
              return (
                <li key={i}>
                  <p>{ticket.title}</p>
                  <p>{ticket.issue}</p>
                  <button onClick={() => resolveTicket(i)}>
                    Resolve Ticket
                  </button>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </>
    )}
  </div>
  );
}

export default App;
      