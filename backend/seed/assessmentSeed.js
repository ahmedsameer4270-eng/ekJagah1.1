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
    },

    // ==========================================
    // JAVASCRIPT - HARD (5 Questions)
    // ==========================================
    {
        skill_id: 'javascript',
        level: 'hard',
        topic: 'Event Loop & Microtasks',
        question_text: 'In what order will "Promise.resolve().then()", "setTimeout(fn, 0)", and "queueMicrotask(fn)" execute relative to synchronous code in the modern JS Event Loop?',
        options: [
            'setTimeout -> Promise.then -> queueMicrotask',
            'Synchronous code -> Microtasks (queueMicrotask, Promise.then) -> Macrotasks (setTimeout)',
            'Macrotasks -> Microtasks -> Synchronous code',
            'All execute concurrently via multithreading'
        ],
        correct_option_index: 1,
        explanation: 'The JavaScript engine drains the microtask queue (which includes resolved Promise handlers and queueMicrotask) before picking the next task from the macrotask queue (such as setTimeout).'
    },
    {
        skill_id: 'javascript',
        level: 'hard',
        topic: 'Prototypes & Memory',
        question_text: 'What happens when property assignment occurs on an object whose prototype has a read-only property of the same name (writable: false) in strict mode?',
        options: [
            'It shadows the prototype property without error',
            'It throws a TypeError in strict mode and prevents creation of the own property',
            'It deletes the property from the prototype',
            'It automatically sets writable: true'
        ],
        correct_option_index: 1,
        explanation: 'In strict mode, assigning to a non-writable property on the prototype chain raises a TypeError and prevents shadowing.'
    },
    {
        skill_id: 'javascript',
        level: 'hard',
        topic: 'Memory Management & WeakMap',
        question_text: 'Why are keys in a WeakMap held weakly, and what are the valid key types?',
        options: [
            'Keys can be primitive numbers; they are held weakly to reduce CPU cache size',
            'Keys must be non-primitive objects (or non-registered symbols); holding them weakly allows garbage collection when no other references exist',
            'Keys must be strings only for rapid hashing',
            'Keys can be anything; weak references prevent circular JSON serialization'
        ],
        correct_option_index: 1,
        explanation: 'WeakMap keys must be objects (or registered symbols), allowing the garbage collector to reclaim key objects and values when references elsewhere are lost.'
    },
    {
        skill_id: 'javascript',
        level: 'hard',
        topic: 'Proxy & Metaprogramming',
        question_text: 'Which Proxy trap intercepts object property access and method invocation?',
        options: ['get()', 'apply()', 'construct()', 'has()'],
        correct_option_index: 0,
        explanation: 'The get trap intercepts reading of properties (e.g. proxy.foo or proxy[foo]), including method access prior to invocation.'
    },
    {
        skill_id: 'javascript',
        level: 'hard',
        topic: 'Generators & Iteration',
        question_text: 'What is returned by invoking next() on a generator function that has executed a return statement with a value?',
        options: [
            '{ value: undefined, done: true }',
            '{ value: returnedValue, done: true }',
            'It throws an UnexpectedReturnError',
            '{ value: returnedValue, done: false }'
        ],
        correct_option_index: 1,
        explanation: 'When a generator encounters a return value, next() yields { value: returnedValue, done: true }, signaling termination.'
    },

    // ==========================================
    // REACT - HARD (5 Questions)
    // ==========================================
    {
        skill_id: 'react',
        level: 'hard',
        topic: 'Fiber Architecture & Reconciliation',
        question_text: 'What is the primary architectural purpose of the React Fiber reconciler compared to the legacy stack reconciler?',
        options: [
            'To convert React components into web workers',
            'To enable incremental rendering by breaking rendering work into interruptible units prioritizing high-priority user interactions',
            'To replace JSX with direct HTML string templating',
            'To force synchronous DOM mutations for performance'
        ],
        correct_option_index: 1,
        explanation: 'React Fiber enables time-slicing and interruptible render phases, allowing high-priority events (e.g. typing or animations) to preempt long-running background rendering.'
    },
    {
        skill_id: 'react',
        level: 'hard',
        topic: 'Concurrent Features & useTransition',
        question_text: 'What distinguishes state updates wrapped in startTransition() from standard setState() calls in React 18+?',
        options: [
            'Transitions execute on a separate Node.js server thread',
            'Transition updates are marked as non-urgent and can be interrupted by urgent updates like typing or clicking',
            'Transitions bypass virtual DOM diffing entirely',
            'Transitions force an immediate synchronous repaint'
        ],
        correct_option_index: 1,
        explanation: 'startTransition lets you mark UI updates as transitions, keeping the user interface responsive during heavy state changes.'
    },
    {
        skill_id: 'react',
        level: 'hard',
        topic: 'Hooks Internals & Memory',
        question_text: 'Why do hooks rely on consistent invocation order across renders (the Rules of Hooks)?',
        options: [
            'React attaches hook state to a single linked list on the component Fiber node in call order',
            'The browser JavaScript call stack requires alphabetical ordering',
            'React compiles hooks into static CSS stylesheets',
            'To prevent multi-threaded race conditions'
        ],
        correct_option_index: 0,
        explanation: 'Hooks are represented as a singly linked list stored on the current Fiber; React correlates state between renders purely through invocation index.'
    },
    {
        skill_id: 'react',
        level: 'hard',
        topic: 'Server Components & Streaming',
        question_text: 'What is true regarding React Server Components (RSC) vs Client Components?',
        options: [
            'Server Components ship their component code bundle to the client browser',
            'Server Components execute exclusively on the server, shipping zero JavaScript bundle to the client and streaming serialized virtual DOM format',
            'Server Components can use useState and useEffect freely',
            'Server Components cannot query databases directly'
        ],
        correct_option_index: 1,
        explanation: 'Server Components never send their JavaScript dependencies to the client browser, drastically reducing client bundle sizes and enabling secure direct server data access.'
    },
    {
        skill_id: 'react',
        level: 'hard',
        topic: 'Context & Re-render Optimization',
        question_text: 'How can you prevent all consumer components from re-rendering when only a specific slice of a large Context value changes?',
        options: [
            'Wrap the entire Context.Provider in React.memo',
            'Split the context into smaller scoped contexts or use a selector-based external store pattern (e.g. useSyncExternalStore)',
            'Add async await inside the component render body',
            'Disable strict mode in index.jsx'
        ],
        correct_option_index: 1,
        explanation: 'Because React Context triggers re-renders on all useContext consumers when the provider value reference changes, splitting contexts or employing useSyncExternalStore with selectors avoids redundant renders.'
    },

    // ==========================================
    // SQL - HARD (5 Questions)
    // ==========================================
    {
        skill_id: 'sql',
        level: 'hard',
        topic: 'Window Functions & PARTITION BY',
        question_text: 'What is the key difference between RANK() and DENSE_RANK() window functions when duplicate values occur?',
        options: [
            'RANK() skips ranks after ties (e.g. 1, 2, 2, 4); DENSE_RANK() does not skip ranks (e.g. 1, 2, 2, 3)',
            'RANK() requires an ORDER BY clause while DENSE_RANK() does not',
            'DENSE_RANK() only works with integer primary keys',
            'RANK() partitions data across servers while DENSE_RANK() operates locally'
        ],
        correct_option_index: 0,
        explanation: 'RANK produces gaps in ranking after ties (e.g., 1, 2, 2, 4), whereas DENSE_RANK assigns consecutive integers without gaps (1, 2, 2, 3).'
    },
    {
        skill_id: 'sql',
        level: 'hard',
        topic: 'Transaction Isolation & Phantom Reads',
        question_text: 'Which SQL transaction isolation level prevents dirty reads, non-repeatable reads, AND phantom reads completely?',
        options: ['READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE', 'READ UNCOMMITTED'],
        correct_option_index: 2,
        explanation: 'SERIALIZABLE is the highest isolation level, completely eliminating phantom reads by emulating sequential transaction execution.'
    },
    {
        skill_id: 'sql',
        level: 'hard',
        topic: 'Query Optimization & Indexing',
        question_text: 'When is a composite B-Tree index on columns (A, B, C) usable by the query planner?',
        options: [
            'Only when all three columns A, B, and C are present in the WHERE clause',
            'For queries filtering on A, or (A, B), or (A, B, C) according to the leftmost prefix rule, but NOT for queries filtering on B and C alone',
            'For any combination of columns in any order',
            'Only for SELECT COUNT(*) queries'
        ],
        correct_option_index: 1,
        explanation: 'B-Tree composite indexes follow the leftmost prefix rule: leading columns must be constrained for the index tree to be traversed efficiently.'
    },
    {
        skill_id: 'sql',
        level: 'hard',
        topic: 'CTEs & Recursive Queries',
        question_text: 'What are the two required UNION components in a standard recursive Common Table Expression (WITH RECURSIVE)?',
        options: [
            'An Anchor member and a Recursive member referencing the CTE name itself',
            'A PRIMARY KEY and a FOREIGN KEY',
            'A TRIGGER and an INDEX',
            'A HAVING clause and an OFFSET clause'
        ],
        correct_option_index: 0,
        explanation: 'Recursive CTEs require an initial anchor query UNIONed with a recursive query that references the CTE iteratively until an empty set is produced.'
    },
    {
        skill_id: 'sql',
        level: 'hard',
        topic: 'EXPLAIN & Join Algorithms',
        question_text: 'Which join algorithm is typically chosen by a database optimizer when joining two large, unsorted datasets without relevant indexes?',
        options: ['Nested Loop Join', 'Hash Join', 'Single Row Lookup', 'Index Scan'],
        correct_option_index: 1,
        explanation: 'A Hash Join builds an in-memory hash table of the smaller relation and scans the larger relation to find matches in O(M + N) time.'
    },

    // ==========================================
    // DSA - HARD (5 Questions)
    // ==========================================
    {
        skill_id: 'dsa',
        level: 'hard',
        topic: 'Graph Algorithms & Shortest Path',
        question_text: 'Why does Dijkstra’s algorithm fail or produce incorrect results on graphs with negative edge weights, and which algorithm should be used instead?',
        options: [
            'It assumes once a node is visited its shortest path is finalized (greedy choice); Bellman-Ford should be used for negative edges',
            'It runs in O(N!) factorial time; use Breadth-First Search instead',
            'It requires directed acyclic graphs only; use Floyd-Warshall instead',
            'It can only handle weighted trees'
        ],
        correct_option_index: 0,
        explanation: 'Dijkstra assumes paths never decrease in cost once settled; Bellman-Ford relaxes all edges |V|-1 times and can detect negative-weight cycles.'
    },
    {
        skill_id: 'dsa',
        level: 'hard',
        topic: 'Dynamic Programming & Intervals',
        question_text: 'What is the optimal time complexity to solve the Longest Increasing Subsequence (LIS) problem of size N using binary search patience sorting?',
        options: ['O(N^2)', 'O(N log N)', 'O(N)', 'O(2^N)'],
        correct_option_index: 1,
        explanation: 'By maintaining an active tails array and performing binary search (bisect_left) for each element, LIS is solved in O(N log N) time.'
    },
    {
        skill_id: 'dsa',
        level: 'hard',
        topic: 'Advanced Trees & Balanced BSTs',
        question_text: 'What is the maximum number of rotations required to rebalance an AVL tree after a single node insertion vs deletion?',
        options: [
            'At most 2 rotations for insertion; up to O(log N) rotations propagating to the root for deletion',
            'O(log N) for insertion; 1 for deletion',
            'Zero rotations are needed for AVL trees',
            'Exactly N rotations for both'
        ],
        correct_option_index: 0,
        explanation: 'An AVL insertion requires at most 1 single or double rotation (2 rotations) to restore the balance factor, whereas deletion can require rebalancing along the entire O(log N) path to root.'
    },
    {
        skill_id: 'dsa',
        level: 'hard',
        topic: 'String Matching & Automata',
        question_text: 'What does the failure function (prefix table / pi array) in the Knuth-Morris-Pratt (KMP) string matching algorithm represent?',
        options: [
            'The hash sum of all characters in the pattern',
            'The length of the longest proper prefix of the pattern that is also a proper suffix of the pattern up to that index',
            'The count of vowels in the text',
            'The number of matching anagrams'
        ],
        correct_option_index: 1,
        explanation: 'The KMP pi array precomputes the longest proper prefix that matches a suffix, allowing the algorithm to bypass re-examining previously matched characters in O(M + N) time.'
    },
    {
        skill_id: 'dsa',
        level: 'hard',
        topic: 'Disjoint Set Union & Path Compression',
        question_text: 'What is the amortized time complexity per operation of a Disjoint Set Union (Union-Find) structure with both union by rank and path compression?',
        options: ['O(log N)', 'O(α(N)) - inverse Ackermann function', 'O(N)', 'O(1) strictly worst-case'],
        correct_option_index: 1,
        explanation: 'Combining path compression and union by rank achieves an amortized per-operation complexity of O(α(N)), which is practically less than 5 for all realistic universe sizes.'
    },

    // ==========================================
    // JAVA - HARD (5 Questions)
    // ==========================================
    {
        skill_id: 'java',
        level: 'hard',
        topic: 'Memory Model & Volatile',
        question_text: 'What memory visibility and ordering guarantees does the "volatile" keyword provide according to the Java Memory Model (JMM)?',
        options: [
            'It provides mutual exclusion locks like synchronized',
            'It guarantees that writes are immediately visible to all threads (no thread-local caching) and creates a happens-before relationship preventing instruction reordering',
            'It makes complex operations like count++ atomic',
            'It moves the variable into off-heap memory'
        ],
        correct_option_index: 1,
        explanation: 'volatile guarantees visibility of writes across threads and enforces memory barriers preventing instruction reordering, but does not provide mutual exclusion for compound operations.'
    },
    {
        skill_id: 'java',
        level: 'hard',
        topic: 'Garbage Collection & Generations',
        question_text: 'In the JVM G1 (Garbage-First) collector, how is the heap organized compared to traditional generation collectors?',
        options: [
            'A single continuous memory block without generational division',
            'The heap is partitioned into a large set of equal-sized non-contiguous regions, dynamically assigned roles (Eden, Survivor, Old)',
            'Memory is allocated entirely in operating system disk swap space',
            'Only on-stack allocations are allowed'
        ],
        correct_option_index: 1,
        explanation: 'G1 divides heap memory into thousands of equal regions and incrementally reclaims regions with the most garbage (garbage-first) to meet pause time goals.'
    },
    {
        skill_id: 'java',
        level: 'hard',
        topic: 'Generics & Type Erasure',
        question_text: 'What is the effect of Java type erasure on generic classes at runtime?',
        options: [
            'Type arguments are replaced by their bounds (or Object) and bridge methods are inserted as needed; generic type parameters do not exist in bytecode at runtime',
            'Generic types are specialized into separate C++ style templates per primitive',
            'Generics cannot be inspected by Reflection at all',
            'It causes all collections to become thread-safe'
        ],
        correct_option_index: 0,
        explanation: 'Java generics were designed for backward compatibility: the compiler erases type arguments to their bounding types (or Object) and adds casts, meaning List<String> and List<Integer> share the exact same class at runtime.'
    },
    {
        skill_id: 'java',
        level: 'hard',
        topic: 'Concurrency & CompletableFuture',
        question_text: 'What is the default Executor used by CompletableFuture.supplyAsync() when no custom thread pool is supplied?',
        options: [
            'Executors.newSingleThreadExecutor()',
            'ForkJoinPool.commonPool()',
            'A new thread spawned for each invocation without pooling',
            'The main UI thread'
        ],
        correct_option_index: 1,
        explanation: 'CompletableFuture defaults to ForkJoinPool.commonPool(), which employs a work-stealing algorithm with parallelism sized to CPU cores.'
    },
    {
        skill_id: 'java',
        level: 'hard',
        topic: 'ClassLoader Hierarchy',
        question_text: 'What principle governs the Java ClassLoader delegation model?',
        options: [
            'Child-first loading',
            'Parent-delegation principle: a class loader delegates the request to its parent before attempting to locate and define the class itself',
            'Peer-to-peer broadcast loading',
            'Random selection among all active class loaders'
        ],
        correct_option_index: 1,
        explanation: 'The parent-delegation model ensures security and core class integrity (e.g. preventing user code from overriding java.lang.Object).'
    },

    // ==========================================
    // C++ - HARD (5 Questions)
    // ==========================================
    {
        skill_id: 'cpp',
        level: 'hard',
        topic: 'Move Semantics & Perfect Forwarding',
        question_text: 'What does std::forward<T>(arg) do that std::move(arg) does not?',
        options: [
            'std::forward unconditionally casts to an rvalue; std::move conditionally casts',
            'std::forward preserves the original value category (lvalue or rvalue) of the argument based on template parameter T; std::move unconditionally casts to rvalue',
            'std::forward allocates heap memory',
            'std::forward is a compiler intrinsic that executes threads'
        ],
        correct_option_index: 1,
        explanation: 'std::forward conditionally casts to an rvalue reference only if the original parameter was passed as an rvalue, enabling perfect forwarding in templates.'
    },
    {
        skill_id: 'cpp',
        level: 'hard',
        topic: 'Templates & SFINAE',
        question_text: 'What does SFINAE stand for in C++ template metaprogramming, and what is its effect?',
        options: [
            'Substitution Failure Is Not An Error: if substituting a deduced type fails during overload resolution, the compiler discards the candidate rather than halting with a compilation error',
            'Stack Frame Initialization Not Allowed Explicitly',
            'Static Function Inlining And Native Execution',
            'Synchronous File I/O Notification And Execution'
        ],
        correct_option_index: 0,
        explanation: 'SFINAE allows developers to selectively enable or disable function templates based on type traits (std::enable_if or C++20 concepts) without hard compilation failures.'
    },
    {
        skill_id: 'cpp',
        level: 'hard',
        topic: 'Smart Pointers & Memory Management',
        question_text: 'What problem occurs when two objects manage each other using std::shared_ptr, and how is it resolved?',
        options: [
            'A segmentation fault occurs on allocation; solved by using raw pointers',
            'A cyclic reference prevents reference counts from ever reaching zero (memory leak); resolved by breaking the cycle with std::weak_ptr',
            'It causes double-free errors on exit',
            'It deadlocks the main thread'
        ],
        correct_option_index: 1,
        explanation: 'Cyclic shared_ptr ownership keeps reference counts positive indefinitely, preventing destruction. std::weak_ptr observes an object without incrementing the strong reference count.'
    },
    {
        skill_id: 'cpp',
        level: 'hard',
        topic: 'RAII & Virtual Destructors',
        question_text: 'Why MUST a base class destructor be declared virtual when deleting a derived class object through a pointer to base?',
        options: [
            'To prevent compiler optimization passes',
            'To ensure the derived class destructor is invoked dynamically; otherwise, undefined behavior and resource leaks occur',
            'Because C++ requires all methods in a base class to be virtual',
            'To allocate derived classes on the heap automatically'
        ],
        correct_option_index: 1,
        explanation: 'Deleting a derived instance via a base pointer with a non-virtual destructor results in undefined behavior because the derived destructor is never invoked.'
    },
    {
        skill_id: 'cpp',
        level: 'hard',
        topic: 'Memory Alignment & Cache Locality',
        question_text: 'What is the purpose of alignas() and std::hardware_destructive_interference_size in high-performance C++?',
        options: [
            'To align data to CPU cache lines (typically 64 bytes) to prevent false sharing between concurrent threads',
            'To compress memory on RAM chips',
            'To enforce AES encryption of variables',
            'To limit maximum stack depth'
        ],
        correct_option_index: 0,
        explanation: 'Aligning variables to separate cache lines prevents false sharing, where multiple threads invalidating neighboring data in the same L1/L2 cache line degrade performance.'
    },

    // ==========================================
    // C - HARD (5 Questions)
    // ==========================================
    {
        skill_id: 'c',
        level: 'hard',
        topic: 'Function Pointers & Dynamic Dispatch',
        question_text: 'How do you declare a pointer named "func_ptr" to a function taking an int and double and returning a char*?',
        options: [
            'char* func_ptr(int, double);',
            'char* (*func_ptr)(int, double);',
            'char* func_ptr*(int, double);',
            '(*char) func_ptr(int, double);'
        ],
        correct_option_index: 1,
        explanation: 'In C syntax, parentheses around (*func_ptr) bind the asterisk to the pointer identifier: char* (*func_ptr)(int, double);'
    },
    {
        skill_id: 'c',
        level: 'hard',
        topic: 'Structure Padding & Alignment',
        question_text: 'Why does sizeof(struct { char a; int b; char c; }) evaluate to 12 bytes instead of 6 on a 32/64-bit architecture with 4-byte int alignment?',
        options: [
            'Compilers inject memory leaks randomly',
            'The compiler pads 3 bytes after each char so the int and the struct boundaries align with 4-byte word boundaries for CPU performance',
            'char types always occupy 4 bytes in structs',
            'The compiler adds an encrypted header to structs'
        ],
        correct_option_index: 1,
        explanation: 'CPUs access memory faster when multi-byte words are aligned to multiples of their size; compilers insert padding bytes between fields to satisfy natural alignment requirements.'
    },
    {
        skill_id: 'c',
        level: 'hard',
        topic: 'Volatile & Signal Handling',
        question_text: 'Why must variables shared between an interrupt service routine (or POSIX signal handler) and the main thread be declared "volatile sig_atomic_t"?',
        options: [
            'To prevent the compiler from optimizing away reads/writes into registers and ensure atomic read/write access without partial state interrupts',
            'To allocate the variable in network memory',
            'To encrypt the variable against memory dumps',
            'To prevent recursive signal delivery'
        ],
        correct_option_index: 0,
        explanation: 'volatile prevents compiler register caching of the value across async interrupts, and sig_atomic_t guarantees the variable is read/written in a single atomic instruction.'
    },
    {
        skill_id: 'c',
        level: 'hard',
        topic: 'Virtual Memory & mmap',
        question_text: 'What are the benefits of using mmap() with MAP_SHARED instead of standard read()/write() syscalls for large file processing in C?',
        options: [
            'It maps file pages directly into the process virtual address space, avoiding user-kernel buffer copying and enabling zero-copy I/O',
            'It compresses files on disk automatically',
            'It deletes the file when the program exits',
            'It forces CPU multithreading on disk access'
        ],
        correct_option_index: 0,
        explanation: 'mmap maps files into virtual memory using page tables, eliminating context-switch and buffer copying overhead associated with read/write syscalls.'
    },
    {
        skill_id: 'c',
        level: 'hard',
        topic: 'Endianness & Bitwise Manipulation',
        question_text: 'How can you determine if a system is Little-Endian or Big-Endian in C at runtime?',
        options: [
            'Check if sizeof(int) == 4',
            'Inspect the first byte of an integer: unsigned int x = 1; char *c = (char*)&x; if (*c == 1) it is Little-Endian',
            'Check the compiler version via __GNUC__',
            'Call malloc(1) and check the pointer address parity'
        ],
        correct_option_index: 1,
        explanation: 'In Little-Endian architectures, the least significant byte is stored at the lowest memory address (*c == 1); in Big-Endian, the most significant byte is stored first (*c == 0).'
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

    // Ensure all questions exist (upsert missing questions)
    console.log('🌱 Verifying assessment questions database...');
    let addedCount = 0;
    for (const q of questionsData) {
        const existing = await db.query(
            'SELECT id FROM assessment_questions WHERE skill_id = $1 AND level = $2 AND question_text = $3',
            [q.skill_id, q.level, q.question_text]
        );
        if (existing.rows.length === 0) {
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
            addedCount++;
        }
    }

    const totalCheck = await db.query('SELECT COUNT(*) as count FROM assessment_questions');
    const finalCount = parseInt(totalCheck.rows[0]?.count || 0, 10);
    console.log(`✅ Assessment questions verified. Added ${addedCount} new questions. Total active in DB: ${finalCount}`);
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
