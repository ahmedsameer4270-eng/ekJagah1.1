const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const skillsData = [
    {
        id: 'python',
        name: 'Python',
        category: 'Programming Languages',
        description: 'Core syntax, data structures, control flow, functions, OOP, and standard libraries.',
        icon: 'Code',
        question_count: 15,
        time_limit_minutes: 15
    },
    {
        id: 'javascript',
        name: 'JavaScript',
        category: 'Web Development',
        description: 'ES6+ syntax, asynchronous programming, DOM, closures, promises, and modern engines.',
        icon: 'FileCode',
        question_count: 15,
        time_limit_minutes: 15
    },
    {
        id: 'react',
        name: 'React.js',
        category: 'Web Development',
        description: 'Components, hooks (useState, useEffect, useMemo), virtual DOM, state management, and lifecycle.',
        icon: 'Atom',
        question_count: 15,
        time_limit_minutes: 15
    },
    {
        id: 'sql',
        name: 'SQL & Relational DBs',
        category: 'Data & Databases',
        description: 'SELECT queries, JOINs, aggregations, indexing, normalization, transactions, and ACID.',
        icon: 'Database',
        question_count: 15,
        time_limit_minutes: 15
    },
    {
        id: 'dsa',
        name: 'Data Structures & Algorithms',
        category: 'Computer Science',
        description: 'Arrays, linked lists, trees, graphs, sorting, searching, Big-O complexity, and recursion.',
        icon: 'Cpu',
        question_count: 15,
        time_limit_minutes: 15
    },
    {
        id: 'java',
        name: 'Java',
        category: 'Programming Languages',
        description: 'Object-oriented programming, collections framework, JVM memory model, and multithreading.',
        icon: 'Coffee',
        question_count: 15,
        time_limit_minutes: 15
    },
    {
        id: 'cpp',
        name: 'C++',
        category: 'Systems & Programming',
        description: 'Pointers, memory management, templates, STL containers, OOP, and RAII.',
        icon: 'Terminal',
        question_count: 15,
        time_limit_minutes: 15
    },
    {
        id: 'c',
        name: 'C Programming',
        category: 'Systems & Programming',
        description: 'Pointers, manual memory allocation (malloc/free), structs, file I/O, and low-level constructs.',
        icon: 'Hash',
        question_count: 15,
        time_limit_minutes: 15
    }
];

const questionsData = [
    // ==========================================
    // PYTHON - BASIC (16 Questions across 5 topics)
    // ==========================================
    // Topic: Syntax & Variables
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Syntax & Variables',
        question_text: 'What will be the output of type(3 / 2) in Python 3?',
        options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'number'>"],
        correct_option_index: 1,
        explanation: 'In Python 3, the single slash / operator performs true float division, yielding 1.5 of type float, whereas // does floor division.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Syntax & Variables',
        question_text: 'Which of the following is an invalid variable identifier in Python?',
        options: ['_user_id', 'var2_name', '2nd_student', 'student_name'],
        correct_option_index: 2,
        explanation: 'Variable names in Python cannot begin with a number or digit (e.g. 2nd_student).'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Syntax & Variables',
        question_text: 'What does the "is" operator check in Python?',
        options: ['Value equality', 'Object identity (exact same memory address)', 'Type similarity', 'Subclass relation'],
        correct_option_index: 1,
        explanation: 'The "is" keyword tests object identity (whether id(a) == id(b)), whereas "==" tests value equality.'
    },

    // Topic: Control Flow & Loops
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Control Flow & Loops',
        question_text: 'What is the output of the following code snippet?\nfor i in range(1, 6, 2):\n    print(i, end=" ")',
        options: ['1 2 3 4 5', '1 3 5', '2 4 6', '1 3'],
        correct_option_index: 1,
        explanation: 'range(start, stop, step) begins at 1 and increments by 2 up to but not including 6, generating 1, 3, 5.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Control Flow & Loops',
        question_text: 'When does the "else" block of a for or while loop execute in Python?',
        options: [
            'When the loop terminates normally without encountering a break statement',
            'When a break statement is explicitly executed',
            'Whenever an unhandled exception occurs inside the loop body',
            'On every single iteration of the loop'
        ],
        correct_option_index: 0,
        explanation: 'In Python loops, the else block runs only if the loop completed all iterations without encountering a break statement.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Control Flow & Loops',
        question_text: 'What do bool([]) and bool([0]) evaluate to in Python?',
        options: ['False and False', 'True and False', 'False and True', 'True and True'],
        correct_option_index: 2,
        explanation: 'An empty collection [] is falsy, while a list containing an element [0] has length 1 and evaluates to truthy.'
    },

    // Topic: Functions & Scope
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Functions & Scope',
        question_text: 'What happens when a function is defined with a mutable default argument, such as: def append_val(x, arr=[]): arr.append(x); return arr?',
        options: [
            'A new list is allocated on each call',
            'The default list is instantiated once at function definition and shared across invocations',
            'Python raises a SyntaxError at compile time',
            'arr is reset to empty automatically after returning'
        ],
        correct_option_index: 1,
        explanation: 'Default arguments are evaluated once when the function definition is executed. Modifying mutable defaults persists across subsequent calls.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Functions & Scope',
        question_text: 'Which keyword allows a function to modify a variable defined in an enclosing (non-global) nested scope?',
        options: ['global', 'nonlocal', 'outer', 'super'],
        correct_option_index: 1,
        explanation: 'The nonlocal keyword allows binding to variables in outer enclosing function scopes that are not global.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Functions & Scope',
        question_text: 'What is the output of the lambda call: (lambda x, y: x * y + 2)(3, 4)?',
        options: ['14', '18', '24', '12'],
        correct_option_index: 0,
        explanation: 'The anonymous function calculates 3 * 4 + 2 = 12 + 2 = 14.'
    },

    // Topic: Data Structures
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Data Structures',
        question_text: 'What is the average time complexity of looking up an existing key in a Python dictionary (dict)?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
        correct_option_index: 2,
        explanation: 'Python dict is implemented using an optimized hash table, offering O(1) average lookup and insertion time.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Data Structures',
        question_text: 'Which of the following built-in collection types in Python is immutable?',
        options: ['List', 'Dictionary', 'Set', 'Tuple'],
        correct_option_index: 3,
        explanation: 'Tuples are immutable; once instantiated, their elements and size cannot be changed.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Data Structures',
        question_text: 'What is the result of set([1, 2, 2, 3, 4, 4, 1]) when converted back to a sorted list?',
        options: ['[1, 2, 2, 3, 4, 4, 1]', '[1, 2, 3, 4]', '[2, 4]', 'Raises a TypeError'],
        correct_option_index: 1,
        explanation: 'Sets deduplicate elements, retaining only unique items [1, 2, 3, 4].'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'Data Structures',
        question_text: 'What does the list comprehension [x**2 for x in range(5) if x % 2 != 0] produce?',
        options: ['[1, 9]', '[0, 4, 16]', '[1, 4, 9]', '[1, 9, 25]'],
        correct_option_index: 0,
        explanation: 'Odd numbers in 0..4 are 1 and 3. Squaring them produces [1, 9].'
    },

    // Topic: OOP & Exceptions
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'OOP & Exceptions',
        question_text: 'What is the purpose of the __init__ method in a Python class?',
        options: [
            'Class destructor when object is garbage collected',
            'Instance initializer method called upon object creation',
            'A static method to instantiate subclasses',
            'A compiler hook for bytecode optimization'
        ],
        correct_option_index: 1,
        explanation: '__init__ acts as the constructor/initializer, called right after a new instance is created to set initial attributes.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'OOP & Exceptions',
        question_text: 'Which block in a try...except...else...finally statement is GUARANTEED to execute whether an exception occurred or not?',
        options: ['try', 'except', 'else', 'finally'],
        correct_option_index: 3,
        explanation: 'The finally clause always executes before exiting the try statement, making it ideal for releasing resources.'
    },
    {
        skill_id: 'python',
        level: 'basic',
        topic: 'OOP & Exceptions',
        question_text: 'How is class inheritance declared in Python?',
        options: ['class Dog extends Animal:', 'class Dog(Animal):', 'class Dog implements Animal:', 'class Dog : public Animal:'],
        correct_option_index: 1,
        explanation: 'In Python, inheritance syntax places the parent class inside parentheses: class Dog(Animal):'
    },

    // ==========================================
    // PYTHON - INTERMEDIATE (5 Questions)
    // ==========================================
    {
        skill_id: 'python',
        level: 'intermediate',
        topic: 'Generators & Iterators',
        question_text: 'What is the primary difference between a generator function using "yield" and a standard function using "return"?',
        options: [
            'Generators execute on a separate OS thread',
            'Generators produce values lazily on demand, pausing state between yields without loading all items in memory',
            'Generators can only yield integer values',
            'Return functions are deprecated in modern Python 3'
        ],
        correct_option_index: 1,
        explanation: 'Generators return an iterator and maintain execution frame state across yields, conserving memory for large data streams.'
    },
    {
        skill_id: 'python',
        level: 'intermediate',
        topic: 'Decorators & Closures',
        question_text: 'In Python, what is a decorator fundamentally?',
        options: [
            'A special class that overrides the __call__ method',
            'A function that takes another function as an argument and returns a modified or wrapped function',
            'A bytecode directive for JIT compilation',
            'A design pattern exclusive to GUI frameworks'
        ],
        correct_option_index: 1,
        explanation: 'A decorator is a callable that accepts a function and returns an augmented callable, applied with the @decorator syntax.'
    },
    {
        skill_id: 'python',
        level: 'intermediate',
        topic: 'Concurrency & GIL',
        question_text: 'What is the Global Interpreter Lock (GIL) in CPython?',
        options: [
            'A mutex that prevents multiple native OS threads from executing Python bytecodes simultaneously',
            'A security sandbox that disables unauthorized file writes',
            'A distributed lock for multiprocessing across network nodes',
            'A garbage collector mechanism that locks objects during mark-and-sweep'
        ],
        correct_option_index: 0,
        explanation: 'The GIL ensures that only one thread executes CPython bytecodes at a time, making CPU-bound multi-threading bottlenecked on a single core.'
    },
    {
        skill_id: 'python',
        level: 'intermediate',
        topic: 'Dunder Methods',
        question_text: 'Which dunder method must be defined to support the "with" context management protocol in Python?',
        options: ['__open__ and __close__', '__enter__ and __exit__', '__start__ and __stop__', '__init__ and __del__'],
        correct_option_index: 1,
        explanation: 'Context managers implement __enter__ (setup/resource acquisition) and __exit__ (cleanup/release).'
    },
    {
        skill_id: 'python',
        level: 'intermediate',
        topic: 'Memory Management',
        question_text: 'How does CPython primarily detect and reclaim unreachable objects in memory?',
        options: [
            'Reference counting supplemented by a cyclic garbage collector',
            'Generational mark-and-sweep only',
            'Manual pointer deallocation via free()',
            'Stop-the-world compaction every 10 seconds'
        ],
        correct_option_index: 0,
        explanation: 'CPython uses reference counting as its main memory management tool, with a cyclic garbage collector to resolve reference cycles.'
    },

    // ==========================================
    // PYTHON - HARD (5 Questions)
    // ==========================================
    {
        skill_id: 'python',
        level: 'hard',
        topic: 'Metaclasses',
        question_text: 'What is a metaclass in Python?',
        options: [
            'A class that inherits from multiple abstract base classes',
            'The class of a class, responsible for defining how classes themselves are constructed and initialized',
            'A decorator that injects static methods into classes',
            'An interface for C-extension bindings'
        ],
        correct_option_index: 1,
        explanation: 'Classes in Python are objects, and their type is a metaclass (by default, `type`). Metaclasses intercept class creation.'
    },
    {
        skill_id: 'python',
        level: 'hard',
        topic: 'Asyncio & Coroutines',
        question_text: 'What does "asyncio.gather(*tasks)" do when one task raises an unhandled exception if return_exceptions=False?',
        options: [
            'It immediately cancels all other tasks and suppresses the exception',
            'The exception is propagated immediately, but other tasks in the gather continue running in the background',
            'It restarts the failed task up to 3 times',
            'It halts the entire event loop thread process'
        ],
        correct_option_index: 1,
        explanation: 'By default, asyncio.gather immediately bubbles the first exception raised, but does not cancel other pending awaitables.'
    },
    {
        skill_id: 'python',
        level: 'hard',
        topic: 'Descriptors Protocol',
        question_text: 'Which methods comprise the Python descriptor protocol?',
        options: [
            '__get__, __set__, and optionally __delete__ / __set_name__',
            '__getattr__, __setattr__, and __delattr__',
            '__read__, __write__, and __flush__',
            '__entry__, __body__, and __exit__'
        ],
        correct_option_index: 0,
        explanation: 'The descriptor protocol is implemented by defining __get__, __set__, and __delete__ on an attribute object.'
    },
    {
        skill_id: 'python',
        level: 'hard',
        topic: 'Bytecode & C-API',
        question_text: 'Which module allows inspection and disassembly of CPython bytecode instructions?',
        options: ['sys', 'ctypes', 'dis', 'marshal'],
        correct_option_index: 2,
        explanation: 'The `dis` module supports analysis of CPython bytecode by disassembling code objects into human-readable instructions.'
    },
    {
        skill_id: 'python',
        level: 'hard',
        topic: 'Memory Profiling & Slots',
        question_text: 'What is the main advantage of specifying __slots__ in a Python class definition?',
        options: [
            'It makes the class thread-safe automatically',
            'It prevents the dynamic creation of __dict__ per instance, significantly saving memory and accelerating attribute access',
            'It enables method overloading like C++',
            'It serializes instances into JSON automatically'
        ],
        correct_option_index: 1,
        explanation: '__slots__ reserves space for a fixed set of attributes, avoiding the creation of an instance dictionary __dict__ and saving substantial RAM.'
    },

    // ==========================================
    // JAVASCRIPT - BASIC (5 Questions)
    // ==========================================
    {
        skill_id: 'javascript',
        level: 'basic',
        topic: 'Variables & Scope',
        question_text: 'What is the difference between "let" and "var" declarations in JavaScript?',
        options: [
            'let has block scope while var has function/global scope',
            'var cannot be reassigned while let can',
            'let is hoisted with value undefined while var is not hoisted',
            'There is no difference in ES6'
        ],
        correct_option_index: 0,
        explanation: 'let provides block-level scoping and is not accessible before its declaration (temporal dead zone), unlike var which has function scope.'
    },
    {
        skill_id: 'javascript',
        level: 'basic',
        topic: 'Equality & Types',
        question_text: 'What does 0 == "0" and 0 === "0" evaluate to in JavaScript?',
        options: ['true and true', 'true and false', 'false and true', 'false and false'],
        correct_option_index: 1,
        explanation: '== performs type coercion (converting "0" to number 0, giving true), whereas === checks both value and type without coercion.'
    },
    {
        skill_id: 'javascript',
        level: 'basic',
        topic: 'Array Methods',
        question_text: 'Which array method creates a new array with all elements that pass the test implemented by the provided function?',
        options: ['forEach()', 'map()', 'filter()', 'reduce()'],
        correct_option_index: 2,
        explanation: 'filter() returns a new array with all elements matching the boolean predicate callback.'
    },
    {
        skill_id: 'javascript',
        level: 'basic',
        topic: 'Asynchronous JS',
        question_text: 'What does a JavaScript Promise represent?',
        options: [
            'A synchronous blocking thread',
            'An object representing the eventual completion or failure of an asynchronous operation',
            'A callback function for event listeners only',
            'A browser web worker process'
        ],
        correct_option_index: 1,
        explanation: 'A Promise is a proxy for a value not necessarily known when the promise is created, transitioning between pending, fulfilled, or rejected.'
    },
    {
        skill_id: 'javascript',
        level: 'basic',
        topic: 'Functions & Closures',
        question_text: 'What is a closure in JavaScript?',
        options: [
            'A function bundled together with references to its surrounding lexical state (scope)',
            'The end of an asynchronous callback chain',
            'A method that closes the browser window',
            'A frozen object that cannot be modified'
        ],
        correct_option_index: 0,
        explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has returned.'
    },

    // ==========================================
    // REACT - BASIC (5 Questions)
    // ==========================================
    {
        skill_id: 'react',
        level: 'basic',
        topic: 'Components & JSX',
        question_text: 'What is JSX in React?',
        options: [
            'A syntax extension for JavaScript that looks similar to XML/HTML, transpiled to React.createElement calls',
            'A new CSS styling framework',
            'A browser plugin required to run React code',
            'A database query language for React'
        ],
        correct_option_index: 0,
        explanation: 'JSX is syntactic sugar that transpiles into React.createElement function calls producing React elements.'
    },
    {
        skill_id: 'react',
        level: 'basic',
        topic: 'Hooks',
        question_text: 'What is the purpose of the useState hook in React functional components?',
        options: [
            'To trigger manual DOM manipulation',
            'To declare state variables that preserve values between re-renders and trigger component updates upon change',
            'To bind server-side web sockets',
            'To configure routing endpoints'
        ],
        correct_option_index: 1,
        explanation: 'useState allows functional components to hold and update local component state across renders.'
    },
    {
        skill_id: 'react',
        level: 'basic',
        topic: 'Lifecycle & useEffect',
        question_text: 'When does a useEffect hook with an empty dependency array [] execute?',
        options: [
            'On every single component re-render',
            'Only once after the initial render (mount)',
            'Only when component props update',
            'Immediately before the component unmounts'
        ],
        correct_option_index: 1,
        explanation: 'Passing an empty dependency array [] causes useEffect to execute once after the initial mounting of the component.'
    },
    {
        skill_id: 'react',
        level: 'basic',
        topic: 'Virtual DOM',
        question_text: 'What is the Virtual DOM in React and why is it used?',
        options: [
            'A lightweight in-memory representation of the real DOM used to compute diffs and minimize costly DOM mutations',
            'A separate browser engine used for 3D graphics',
            'A cloud database for storing user sessions',
            'A secure iframe sandbox for rendering untrusted code'
        ],
        correct_option_index: 0,
        explanation: 'The Virtual DOM allows React to batch and reconcile changes efficiently, applying only the minimal necessary updates to the actual browser DOM.'
    },
    {
        skill_id: 'react',
        level: 'basic',
        topic: 'Props & State',
        question_text: 'What is the key difference between props and state in React?',
        options: [
            'Props are mutable and owned by the component; state is read-only and passed from parents',
            'Props are passed down from parent components and are read-only; state is managed internally by the component and can change over time',
            'Props are only for class components; state is only for functional components',
            'There is no distinction; they are interchangeable'
        ],
        correct_option_index: 1,
        explanation: 'Props are read-only configuration passed from parent to child, whereas state represents local, mutable component data.'
    },

    // ==========================================
    // SQL - BASIC (5 Questions)
    // ==========================================
    {
        skill_id: 'sql',
        level: 'basic',
        topic: 'Basic Queries',
        question_text: 'Which SQL clause is used to filter records based on specified search criteria?',
        options: ['GROUP BY', 'WHERE', 'ORDER BY', 'LIMIT'],
        correct_option_index: 1,
        explanation: 'The WHERE clause filters rows before aggregation, returning only rows that satisfy the given predicate.'
    },
    {
        skill_id: 'sql',
        level: 'basic',
        topic: 'JOIN Operations',
        question_text: 'What is the difference between an INNER JOIN and a LEFT JOIN in SQL?',
        options: [
            'INNER JOIN returns only matching records from both tables; LEFT JOIN returns all records from the left table and matched records from the right table',
            'INNER JOIN returns all records from both tables regardless of match',
            'LEFT JOIN only works on primary key columns',
            'INNER JOIN is slower because it creates duplicate columns'
        ],
        correct_option_index: 0,
        explanation: 'INNER JOIN excludes non-matching rows, while LEFT JOIN preserves all rows from the left table, padding missing right-table columns with NULL.'
    },
    {
        skill_id: 'sql',
        level: 'basic',
        topic: 'Aggregations',
        question_text: 'Which SQL clause filters groups created by a GROUP BY clause?',
        options: ['WHERE', 'HAVING', 'FILTER', 'LIKE'],
        correct_option_index: 1,
        explanation: 'HAVING filters aggregated groups, whereas WHERE filters individual rows prior to grouping.'
    },
    {
        skill_id: 'sql',
        level: 'basic',
        topic: 'Constraints & Keys',
        question_text: 'What defines a PRIMARY KEY in relational databases?',
        options: [
            'A column or set of columns that uniquely identifies each row and cannot contain NULL values',
            'An index that allows duplicate entries for faster searching',
            'A foreign reference to an external table',
            'A temporary table constraint'
        ],
        correct_option_index: 0,
        explanation: 'A PRIMARY KEY uniquely identifies each record in a table, enforcing uniqueness and NOT NULL constraints.'
    },
    {
        skill_id: 'sql',
        level: 'basic',
        topic: 'Transactions & ACID',
        question_text: 'What does the "A" stand for in ACID properties of database transactions?',
        options: ['Availability', 'Atomicity', 'Asynchronous', 'Authorization'],
        correct_option_index: 1,
        explanation: 'Atomicity ensures that all operations in a transaction either succeed completely or are rolled back entirely ("all or nothing").'
    },

    // ==========================================
    // DSA - BASIC (5 Questions)
    // ==========================================
    {
        skill_id: 'dsa',
        level: 'basic',
        topic: 'Complexity Analysis',
        question_text: 'What is the time complexity of binary search on a sorted array of size n?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correct_option_index: 1,
        explanation: 'Binary search halves the search space at each iteration, resulting in logarithmic O(log n) time complexity.'
    },
    {
        skill_id: 'dsa',
        level: 'basic',
        topic: 'Linear Data Structures',
        question_text: 'Which data structure operates on a First-In, First-Out (FIFO) principle?',
        options: ['Stack', 'Queue', 'Binary Heap', 'Tree'],
        correct_option_index: 1,
        explanation: 'A Queue adheres to First-In, First-Out (FIFO), while a Stack is Last-In, First-Out (LIFO).'
    },
    {
        skill_id: 'dsa',
        level: 'basic',
        topic: 'Sorting Algorithms',
        question_text: 'What is the worst-case time complexity of standard QuickSort when poorly chosen pivots are used?',
        options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(2^n)'],
        correct_option_index: 2,
        explanation: 'When pivots divide partitions into 1 and n-1 elements (e.g. sorted input with end pivot), QuickSort degenerates to O(n^2).'
    },
    {
        skill_id: 'dsa',
        level: 'basic',
        topic: 'Trees & Graphs',
        question_text: 'What is the maximum number of children any node can have in a binary tree?',
        options: ['1', '2', '3', 'Unlimited'],
        correct_option_index: 1,
        explanation: 'By definition, each node in a binary tree can have at most two child nodes (left and right).'
    },
    {
        skill_id: 'dsa',
        level: 'basic',
        topic: 'Hashing',
        question_text: 'What is a collision in a hash table?',
        options: [
            'When two distinct keys produce the same hash index',
            'When a hash table runs out of disk storage',
            'When two threads access the hash table concurrently without synchronization',
            'When a key contains non-ASCII characters'
        ],
        correct_option_index: 0,
        explanation: 'A collision occurs when two different keys map to the same bucket index via the hash function, resolved with chaining or open addressing.'
    },

    // ==========================================
    // JAVA - BASIC (5 Questions)
    // ==========================================
    {
        skill_id: 'java',
        level: 'basic',
        topic: 'Core Syntax & JVM',
        question_text: 'What is the function of the Java Virtual Machine (JVM)?',
        options: [
            'To compile Java source code (.java) into bytecode (.class)',
            'To execute Java bytecode on any host platform that has a compatible JVM installed',
            'To manage remote Git repositories',
            'To format source code style'
        ],
        correct_option_index: 1,
        explanation: 'The JVM executes compiled bytecode (.class files), fulfilling Java’s "Write Once, Run Anywhere" philosophy.'
    },
    {
        skill_id: 'java',
        level: 'basic',
        topic: 'OOP Concepts',
        question_text: 'Which keyword in Java is used to inherit a class?',
        options: ['implements', 'extends', 'inherits', 'super'],
        correct_option_index: 1,
        explanation: 'The `extends` keyword is used for class inheritance in Java, while `implements` is used for interfaces.'
    },
    {
        skill_id: 'java',
        level: 'basic',
        topic: 'Collections Framework',
        question_text: 'Which Java Collection class guarantees unique elements and sorts them in natural ascending order?',
        options: ['ArrayList', 'HashSet', 'TreeSet', 'LinkedList'],
        correct_option_index: 2,
        explanation: 'TreeSet implements NavigableSet backed by a Red-Black tree, ensuring unique elements in sorted order.'
    },
    {
        skill_id: 'java',
        level: 'basic',
        topic: 'Exception Handling',
        question_text: 'What is a checked exception in Java?',
        options: [
            'An exception checked at compile-time that must either be handled with try-catch or declared with throws',
            'An exception that inherits from RuntimeException',
            'An exception that immediately crashes the JVM without stacktrace',
            'A unit test assertion error'
        ],
        correct_option_index: 0,
        explanation: 'Checked exceptions inherit directly from Exception (not RuntimeException) and are enforced by the Java compiler.'
    },
    {
        skill_id: 'java',
        level: 'basic',
        topic: 'Strings & Memory',
        question_text: 'Why are String objects immutable in Java?',
        options: [
            'For string pool caching, security, hashcode consistency, and thread safety',
            'Because Java lacks pointer manipulation',
            'To prevent garbage collection from running',
            'It is a legacy bug that could not be changed'
        ],
        correct_option_index: 0,
        explanation: 'String immutability enables String Interning pool reuse, prevents security tampering in network/DB connections, and makes strings thread-safe.'
    },

    // ==========================================
    // C++ - BASIC (5 Questions)
    // ==========================================
    {
        skill_id: 'cpp',
        level: 'basic',
        topic: 'Pointers & References',
        question_text: 'What is the main difference between a pointer and a reference in C++?',
        options: [
            'Pointers can be reassigned and be null, while references must be initialized upon declaration and cannot be null or rebound',
            'References occupy 16 bytes while pointers occupy 4 bytes',
            'Pointers can only point to primitive integers',
            'There is no difference'
        ],
        correct_option_index: 0,
        explanation: 'A reference is an alias bound at initialization that cannot be reseated or null; pointers hold memory addresses and can be reassigned or null.'
    },
    {
        skill_id: 'cpp',
        level: 'basic',
        topic: 'Memory Management',
        question_text: 'Which operator is used to allocate dynamic memory for an array in C++?',
        options: ['malloc()', 'new[]', 'alloc[]', 'create()'],
        correct_option_index: 1,
        explanation: 'The `new[]` operator allocates heap memory for arrays and calls constructors; deallocation requires `delete[]`.'
    },
    {
        skill_id: 'cpp',
        level: 'basic',
        topic: 'OOP & Polymorphism',
        question_text: 'Which keyword enables runtime (dynamic) polymorphism for member functions in C++?',
        options: ['inline', 'static', 'virtual', 'const'],
        correct_option_index: 2,
        explanation: 'The `virtual` keyword creates a vtable entry allowing late-binding of derived class member functions.'
    },
    {
        skill_id: 'cpp',
        level: 'basic',
        topic: 'STL Containers',
        question_text: 'What is the underlying data structure of std::vector in C++?',
        options: ['A doubly linked list', 'A dynamically resizing contiguous array in heap memory', 'A binary search tree', 'A circular queue'],
        correct_option_index: 1,
        explanation: 'std::vector uses a contiguous dynamic buffer, giving O(1) random access and amortized O(1) push_back.'
    },
    {
        skill_id: 'cpp',
        level: 'basic',
        topic: 'RAII Pattern',
        question_text: 'What does the RAII idiom in C++ stand for and accomplish?',
        options: [
            'Resource Acquisition Is Initialization: binds resource lifecycle to object lifetime so destructors automatically release resources',
            'Random Array Index Initialization: sets array values to zero automatically',
            'Runtime Application Interface Integration: links external dynamic libraries',
            'Recursive Algorithm Iteration Index: optimizes loop recursion'
        ],
        correct_option_index: 0,
        explanation: 'RAII ties resource ownership to object lifetime; when the object goes out of scope, its destructor cleans up memory, files, or locks.'
    },

    // ==========================================
    // C - BASIC (5 Questions)
    // ==========================================
    {
        skill_id: 'c',
        level: 'basic',
        topic: 'Pointers & Addresses',
        question_text: 'Which operator is used in C to obtain the memory address of a variable?',
        options: ['*', '&', '->', '%'],
        correct_option_index: 1,
        explanation: 'The address-of operator `&` retrieves the memory address where a variable resides.'
    },
    {
        skill_id: 'c',
        level: 'basic',
        topic: 'Memory Allocation',
        question_text: 'Which standard library function dynamically allocates uninitialized memory in C?',
        options: ['calloc()', 'malloc()', 'realloc()', 'free()'],
        correct_option_index: 1,
        explanation: 'malloc() allocates the specified number of bytes leaving memory uninitialized, whereas calloc() zeroes out the allocated memory.'
    },
    {
        skill_id: 'c',
        level: 'basic',
        topic: 'Strings & Arrays',
        question_text: 'How are strings represented in C?',
        options: [
            'As an instance of the String object class',
            'As an array of characters terminated by a null character (\'\\0\')',
            'As a linked list of single characters',
            'As a byte stream with a fixed 256-byte header'
        ],
        correct_option_index: 1,
        explanation: 'Strings in C are null-terminated character arrays, where the byte \'\\0\' signals the end of the string.'
    },
    {
        skill_id: 'c',
        level: 'basic',
        topic: 'Structs & Unions',
        question_text: 'What is the key difference between a struct and a union in C?',
        options: [
            'In a struct, each member has its own separate memory; in a union, all members share the same memory location',
            'A struct can only contain primitive integers; a union can contain any type',
            'Unions cannot be passed to functions',
            'There is no difference'
        ],
        correct_option_index: 0,
        explanation: 'A struct allocates enough memory for all its fields simultaneously; a union allocates only enough memory for its largest member, sharing memory across fields.'
    },
    {
        skill_id: 'c',
        level: 'basic',
        topic: 'Preprocessor Directives',
        question_text: 'What is the purpose of #ifndef HEADER_H / #define HEADER_H / #endif include guards in C header files?',
        options: [
            'To encrypt header files from inspection',
            'To prevent multiple inclusions of the same header file during compilation, preventing redefinition errors',
            'To speed up CPU clock cycles',
            'To export global variables across projects'
        ],
        correct_option_index: 1,
        explanation: 'Include guards ensure that the header file contents are parsed only once per translation unit, avoiding duplicate declarations.'
    }
];

async function seedAssessmentData() {
    console.log('📝 Checking assessment skills and questions seed...');
    await db.runMigrations();

    // Check if skills exist
    const skillsCheck = await db.query('SELECT COUNT(*) as count FROM assessment_skills');
    const skillCount = parseInt(skillsCheck.rows[0]?.count || 0, 10);

    if (skillCount === 0) {
        console.log('🌱 Seeding assessment skills...');
        for (const skill of skillsData) {
            await db.query(
                `INSERT INTO assessment_skills (id, name, category, description, icon, question_count, time_limit_minutes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [skill.id, skill.name, skill.category, skill.description, skill.icon, skill.question_count, skill.time_limit_minutes]
            );
        }
        console.log(`✅ Seeded ${skillsData.length} assessment skills.`);
    }

    // Check if questions exist
    const questionsCheck = await db.query('SELECT COUNT(*) as count FROM assessment_questions');
    const qCount = parseInt(questionsCheck.rows[0]?.count || 0, 10);

    if (qCount === 0) {
        console.log('🌱 Seeding assessment questions...');
        for (const q of questionsData) {
            const qId = uuidv4();
            await db.query(
                `INSERT INTO assessment_questions (id, skill_id, level, topic, question_text, options, correct_option_index, explanation)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    qId,
                    q.skill_id,
                    q.level,
                    q.topic,
                    q.question_text,
                    JSON.stringify(q.options),
                    q.correct_option_index,
                    q.explanation
                ]
            );
        }
        console.log(`✅ Seeded ${questionsData.length} assessment questions.`);
    } else {
        console.log(`Assessment questions already populated (${qCount} questions).`);
    }
}

module.exports = {
    seedAssessmentData,
    skillsData,
    questionsData
};

if (require.main === module) {
    seedAssessmentData()
        .then(() => {
            console.log('Assessment seeding complete.');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Assessment seeding error:', err);
            process.exit(1);
        });
}
