import mongoose from "mongoose";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

class AccountBase {
  constructor(account) {
    this.account = account;
  }

  validateAmount(amount) {
    if (!amount || isNaN(amount)) throw new Error("Invalid amount");
    if (amount <= 0) throw new Error("Amount must be greater than 0");
  }

  deposit(amount) {
    this.validateAmount(amount);
    this.account.balance += amount;
  }

  withdraw(amount) {
    this.validateAmount(amount);

    if (this.account.balance < amount) {
      throw new Error("Insufficient Balance");
    }

    this.account.balance -= amount;
  }
}

class SavingsAccount extends AccountBase {
  withdraw(amount) {
    this.validateAmount(amount);

    if (amount > 20000) {
      throw new Error("Savings withdrawal limit is 20,000");
    }

    super.withdraw(amount);
  }
}

class CurrentAccount extends AccountBase {
  withdraw(amount) {
    this.validateAmount(amount);

    const overdraftLimit = 5000;

    if (this.account.balance + overdraftLimit < amount) {
      throw new Error("Overdraft limit exceeded");
    }

    this.account.balance -= amount;
  }
}

export default class BankService {
  static getAccountObject(account) {
    if (account.accountType === "savings") return new SavingsAccount(account);
    return new CurrentAccount(account);
  }

  //  Deposit
  static async deposit(accountNumber, amount) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const acc = await Account.findOne({ accountNumber }).session(session);

      if (!acc) throw new Error("Account not found");

      const obj = BankService.getAccountObject(acc);
      obj.deposit(Number(amount));

      await acc.save({ session });

      await Transaction.create(
        [
          {
            senderAccount: null,
            receiverAccount: accountNumber,
            amount: Number(amount),
            type: "deposit",
            date: new Date(),
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return acc;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  //  Withdraw
  static async withdraw(accountNumber, amount) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      amount = Number(amount);
      if (!amount || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const MIN_CURRENT_BALANCE = 5000;

      const acc = await Account.findOne({ accountNumber }).session(session);
      if (!acc) throw new Error("Account not found");

      const minRequired =
        acc.accountType === "current" ? amount + MIN_CURRENT_BALANCE : amount;

      const updated = await Account.findOneAndUpdate(
        {
          accountNumber,
          balance: { $gte: minRequired },
        },
        {
          $inc: { balance: -amount },
        },
        {
          session,
          new: true,
        },
      );

      if (!updated) {
        throw new Error(
          acc.accountType === "current"
            ? `Minimum balance ₹${MIN_CURRENT_BALANCE} required`
            : "Insufficient balance",
        );
      }

      await Transaction.create(
        [
          {
            senderAccount: accountNumber,
            receiverAccount: null,
            amount,
            type: "withdraw",
            date: new Date(),
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return updated;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  static async transfer(sender, receiver, amount, session) {
    amount = Number(amount);
    const MIN_CURRENT_BALANCE = 5000;

    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (sender === receiver) {
      throw new Error("Sender and Receiver cannot be same");
    }

    const senderAcc = await Account.findOne({ accountNumber: sender }).session(
      session,
    );
    if (!senderAcc) throw new Error("Sender not found");

    const minRequired =
      senderAcc.accountType === "current"
        ? amount + MIN_CURRENT_BALANCE
        : amount;

    const updatedSender = await Account.findOneAndUpdate(
      {
        accountNumber: sender,
        balance: { $gte: minRequired },
      },
      {
        $inc: { balance: -amount },
      },
      {
        session,
        new: true,
      },
    );

    if (!updatedSender) {
      throw new Error(
        senderAcc.accountType === "current"
          ? "Minimum balance required"
          : "Insufficient balance",
      );
    }

    const updatedReceiver = await Account.findOneAndUpdate(
      {
        accountNumber: receiver,
      },
      {
        $inc: { balance: amount },
      },
      {
        session,
        new: true,
      },
    );

    if (!updatedReceiver) {
      throw new Error("Receiver not found");
    }

    return {
      sender: updatedSender,
      receiver: updatedReceiver,
    };
  }
}
