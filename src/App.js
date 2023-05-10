import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HelpDesk from "./ITHelpdesk.json";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [issue, setIssue] = useState("");
  const [offChainTicketCount, setOffChainTicketCount] = useState(0);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("low");
  const [deviceType, setDeviceType] = useState("phone");
  const [TicketDetails, setTicketDetails] = useState(null);
  const [ticketId, setTicketId] = useState("");
  const [offChainOpenTicketArray, setOffChainOpenTicketArray] = useState([]);

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  const createTicket = async () => {
    const value = web3.utils.toWei("0.01", "ether"); // adjust the ticket value as needed
    let diff = 0;
    let dev = 0;

    if (difficulty === "Easy") {
      diff = 0;
    } else if (difficulty === "Medium") {
      diff = 1;
    } else if (difficulty === "Hard") {
      diff = 2;
    }

    if (deviceType === "Laptop") {
      diff = 0;
    } else if (deviceType === "Desktop") {
      diff = 1;
    } else if (deviceType === "Mobile") {
      diff = 2;
    }

    try {
      const tx = await contract.methods
        .createTicket(title, issue, description, diff, dev)
        .send({
          value,
          from: account,
          gas: 5000000,
        });
      const { transactionHash } = tx;
      window.alert(`Transaction sent: ${transactionHash}`);
      const { events } = tx;
      const { TicketCreated } = events;
      const { returnValues } = TicketCreated;
      const ticketId = returnValues.ticketId; // define ticketId here
      window.alert(`Ticket created with ID: ${ticketId}`);
      setTitle("");
      setIssue("");
      setDescription("");
      setDifficulty("Easy");
      setDeviceType("phone");
      setOffChainTicketCount(offChainTicketCount + 1);
      await contract.methods.fetchTicket(ticketId);
    } catch (err) {
      console.error(err);
      window.alert("Failed to create ticket");
    }
  };
  //gets data for tickets. if resolvedChoice is false, returns only open tickets. if true, returns resolved tickets
  async function getDataArray(contract, resolvedChoice) {
    const onChainTicketCount = await contract.methods.ticketCount().call();
    //console.log("getDataArray: on chain ticket count is " + onChainTicketCount);

    var workingTicketArray = [];
    //console.log("Resolved =" + resolvedChoice + "-------------------");
    for (let i = 0; i < onChainTicketCount; i++) {
      var ticket = await contract.methods.fetchTicket(i).call();
      console.log(
        "ticket ID: " + ticket.id + "ticket Resolved status" + ticket.resolved
      );
      if (ticket.resolved === resolvedChoice) {
        workingTicketArray.push(ticket);
        //console.log(ticket.id);
      }
    }

    //have a refresh function with a button that refreshes table
    //refresh upon ticket creation
    //console.log("working ticket array is: " + workingTicketArray);

    return workingTicketArray;
  }

  const resolveTicket = async (ticketId) => {
    try {
      const tx = await contract.methods.resolveTicket(ticketId).send({
        from: account,
        gas: 500000,
      });

      const { transactionHash } = tx;
      window.alert(`Transaction sent: ${transactionHash}`);
      const { events } = tx;
      const { TicketResolved } = events;
      const { returnValues } = TicketResolved;
      const resolvedTicketId = returnValues.ticketId; // define resolvedTicketId here
      window.alert(`Ticket resolved with ID: ${ticketId}`);
      //
      const thisTicket = offChainOpenTicketArray.filter(
        (t) => t.ticketId === ticketId
      );
      console.log("the ticket we are resolving is: " + thisTicket);
      //
      //setTicketDetails(null);
      //setTicketId("");
      setResolvedTickets([...resolvedTickets, thisTicket]);
      setOffChainOpenTicketArray((offChainOpenTicketArray) =>
        offChainOpenTicketArray.filter((t) => t.ticketId !== ticketId)
      );
    } catch (err) {
      console.error(err);
      window.alert("Failed to resolve ticket");
    }
  };

  const ticketDetails = async (ticketId) => {
    try {
      const ticket = await contract.methods.fetchTicket(ticketId).call();
      console.log("Ticket Details", ticket);
      alert(
        `Title: ${ticket.title}\nIssue: ${ticket.issue}\nDescription: ${ticket.description}\nDifficulty: ${ticket.difficulty}\nDevice Type: ${ticket.deviceType}\nCreated By: ${ticket.createdBy}\nResolved: ${ticket.resolved}\nResolved By: ${ticket.resolvedBy}`
      );
    } catch (error) {
      console.error(error);
    }
  };

  const TicketNotes = async () => {
    await contract.methods.ticketNotes().send({ from: account });
  };

  const ConnectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const contractAddress = HelpDesk.networks[networkId].address;
        const contract = new web3.eth.Contract(HelpDesk.abi, contractAddress);
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setWeb3(web3);
        setContract(contract);
        console.log("contract in connectWallet" + contract);
        setAccount(account);
        const onChainTicketCount = await contract.methods.ticketCount().call();
        console.log(
          "connectWallet: on chain ticket count is " + onChainTicketCount
        );
        setOffChainTicketCount(parseInt(onChainTicketCount));

        //OPEN TICKET DATA --------
        //console.log("oCTA before set: " + offChainOpenTicketArray);

        const gotOpenTicketData = await getDataArray(contract, false);
        //console.log(typeof gotData[0]);
        //console.log("gotData is " + gotData[0]);

        setOffChainOpenTicketArray(gotOpenTicketData);
        //console.log("oCTA after set: " + offChainOpenTicketArray[0]);

        //console.log("oCTA before set: " + offChainOpenTicketArray);

        //RESOLVED TICKET DATA --------
        const gotResolvedTicketData = await getDataArray(contract, true);
        //console.log(typeof gotData[0]);
        //console.log("gotData is " + gotData[0]);

        setResolvedTickets(gotResolvedTicketData);
        //console.log("oCTA after set: " + offChainOpenTicketArray[0]);
        /*
        const resolvedTickets = [];
        for (let i = 0; i < offChainTicketCount; i++) {
          const ticket = await contract.methods.fetchTicket(i).call();
          if (ticket.resolved) {
            resolvedTickets.push(ticket);
          }
        }
        setResolvedTickets(resolvedTickets);
        */

        //console.log("Open tickets are: " + offChainOpenTicketArray);
        //console.log("---------------------------------------------------");
        //console.log("Resolved tickets are: " + resolvedTickets);
      } else {
        window.alert("Please install MetaMask to use this application");
      }
    } catch (err) {
      console.error(err);
      window.alert("Failed to connect wallet");
    }
  };

  return (
    <div className="App">
      <h1>IT HelpDesk</h1>
      {
        /*{account == null ? (*/
        <button onClick={ConnectWallet}>Connect Wallet</button> /*
      ) : (*/
      }
      <>
        <p>Your account: {account}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createTicket(title, issue, description, difficulty, deviceType);
          }}
        >
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
        <h2>Ticket Count: {offChainTicketCount}</h2>

        <h2>Open Tickets</h2>
        <table bgcolor="black">
          <tbody>
            <tr bgcolor="grey">
              <th>Title</th>
              <th>Issue</th>
              <th>Description</th>
              <th>Difficulty</th>
              <th>Device type</th>
              <th> ticket ID</th>
              <th>Change status</th>
            </tr>

            {Array.from({ length: offChainTicketCount }, (_, i) => i).map(
              (i) => {
                var ticket;
                var ticketIsDefined = false;

                if (!(offChainOpenTicketArray[i] === undefined)) {
                  ticketIsDefined = true;
                  ticket = offChainOpenTicketArray[i];
                }

                if (ticketIsDefined) {
                  return (
                    <tr key={i} bgcolor="lightgrey">
                      <td>{ticket.title}</td>
                      <td>{ticket.issue}</td>
                      <td>{ticket.description}</td>
                      <td>{ticket.difficulty}</td>
                      <td>{ticket.deviceType}</td>
                      <td>ticketId: {ticket.id}</td>
                      <td>
                        <button onClick={() => resolveTicket(i)}>
                          Resolve Ticket
                        </button>
                      </td>
                    </tr>
                  );
                }
                return null;
              }
            )}
          </tbody>
        </table>

        <h2>Resolved Tickets</h2>
        <table bgcolor="black">
          <tbody>
            <tr bgcolor="grey">
              <th>Title</th>
              <th>Issue</th>
              <th>Description</th>
              <th>Difficulty</th>
              <th>Device type</th>
              <th>Ticket ID</th>
              <th>Solution</th>
            </tr>

            {Array.from({ length: offChainTicketCount }, (_, i) => i).map(
              (i) => {
                var ticket;
                var ticketIsDefined = false;

                if (!(resolvedTickets[i] === undefined)) {
                  ticketIsDefined = true;
                  ticket = resolvedTickets[i];
                }

                if (ticketIsDefined) {
                  return (
                    <tr key={i} bgcolor="lightgrey">
                      <td>{ticket.title}</td>
                      <td>{ticket.issue}</td>
                      <td>{ticket.description}</td>
                      <td>{ticket.difficulty}</td>
                      <td>{ticket.deviceType}</td>
                      <td>ticketId: {ticket.id}</td>
                      <td>{ticket.solution}</td>
                    </tr>
                  );
                }
                return null;
              }
            )}
          </tbody>
        </table>
      </>
    </div>
  );
}

export default App;
      