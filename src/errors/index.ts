export class NotFoundError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "NotFoundError";
    }
  }
  
  export class WorkoutPlanNotActiveError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "WorkoutPlanNotActiveError";
    }
  }
  
  export class InvalidSessionCompletionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "InvalidSessionCompletionError";
    }
  }

  export class SessionAlreadyStartedError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "SessionAlreadyStartedError";
    }
  }
  