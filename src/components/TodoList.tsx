import { ChangeEvent, FormEvent, useState } from "react";
import useCustomQuery from "../hooks/useCustomQuery";
import { ITodo } from "../interfaces";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";
import Textarea from "./ui/Textarea";
import axiosinstance from "../config/axios.config";
import TodoSekelton from "./TodoSekelton";
import { onGenerateTodos } from "./utils/Apifaker";

const TodoList = () => {
  const storageKey = "LoggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const [queryVersion, setqueryVersion] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [todoToEdit, settodoToEdit] = useState<ITodo>({
    id: 0,
    description: "",
    title: "",
  });
  const [todoToAdd, settodoToAdd] = useState({
    description: "",
    title: "",
  });

  const { isLoading, data } = useCustomQuery({
    queryKey: ["todoList", `${queryVersion}`], //reload to update page
    url: "/users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData.jwt}`,
      },
    },
  });

  //handlers open and close modal

  const onCloseAddModal = () => {
    settodoToAdd({
      description: "",
      title: "",
    });
    setIsOpenAddModal(false);
  };
  const onOpenAddModal = () => {
    setIsOpenAddModal(true);
  };

  const onCloseEditModal = () => {
    settodoToEdit({
      id: 0,
      description: "",
      title: "",
    });
    setIsEditModalOpen(false);
  };
  const onOpenEditModal = (todo: ITodo) => {
    settodoToEdit(todo);
    setIsEditModalOpen(true);
  };
  const closeConfirmModal = () => {
    settodoToEdit({
      id: 0,
      description: "",
      title: "",
    });
    setIsOpenConfirmModal(false);
  };
  const openConfirmModal = (todo: ITodo) => {
    settodoToEdit(todo);
    setIsOpenConfirmModal(true);
  };

  const onChangeHandler = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = evt.target;
    settodoToEdit({
      ...todoToEdit,
      [name]: value,
    });
  };
  const onChangeAddHandler = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = evt.target;
    settodoToAdd({
      ...todoToAdd,
      [name]: value,
    });
  };
  const onSubmitRemoveTodo = async () => {
    try {
      const { status } = await axiosinstance.delete(`/todos/${todoToEdit.id}`, {
        headers: {
          Authorization: `Bearer ${userData.jwt}`,
        },
      });

      if (status === 200) {
        closeConfirmModal();
        setqueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const submitHandler = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setIsUpdating(true);
    const { title, description } = todoToEdit;
    try {
      const { status } = await axiosinstance.put(
        `/todos/${todoToEdit.id}`,
        {
          data: { title, description },
        },
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseEditModal();
        setqueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };
  const submitAddHandler = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setIsUpdating(true);
    const { title, description } = todoToAdd;
    try {
      const { status } = await axiosinstance.post(
        "/todos",
        {
          data: { title, description, user: [userData.user.id] }, //baib3at user id 3ashan ya7ot todo
        },
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseAddModal();
        setqueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-1 p-3">
        {Array.from({ length: 3 }, (_, idx) => (
          <TodoSekelton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="w-fit mx-auto my-10">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-32 h-9 bg-gray-300 rounded-md dark:bg-gray-400"></div>
            <div className="w-32 h-9 bg-gray-300 rounded-md dark:bg-gray-400"></div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button onClick={onOpenAddModal} size={"sm"}>
              Post new todo
            </Button>
            <Button variant={"outline"} size={"sm"} onClick={onGenerateTodos}>
              Generate todos
            </Button>
          </div>
        )}
      </div>
      {data.todos.length ? (
        data.todos.map((todo: ITodo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100"
          >
            <p className="w-full font-semibold">
              {todo.id} - {todo.title}
            </p>
            <div className="flex items-center justify-end w-full space-x-3">
              <Button onClick={() => onOpenEditModal(todo)} size={"sm"}>
                Edit
              </Button>
              <Button
                onClick={() => openConfirmModal(todo)}
                variant={"danger"}
                size={"sm"}
              >
                Remove
              </Button>
            </div>
          </div>
        ))
      ) : (
        <h3 className="text-xl font-bold text-black">No Todos Yet!</h3>
      )}
      {/* ADD todo modal */}
      <Modal
        isOpen={isOpenAddModal}
        closeModal={onCloseAddModal}
        title="Add this todo"
      >
        <form onSubmit={submitAddHandler} className="space-y-3 ">
          <Input
            name="title"
            value={todoToAdd.title}
            onChange={onChangeAddHandler}
          />
          <Textarea
            name="description"
            value={todoToAdd.description}
            onChange={onChangeAddHandler}
          />
          <div className="flex items-center space-x-3 mt-4">
            <Button
              className="bg-indigo-700 hover:bg-indigo-800"
              isLoading={isUpdating}
            >
              Done
            </Button>
            <Button type="button" onClick={onCloseAddModal} variant={"cancel"}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {/* Edit todo modal */}
      <Modal
        isOpen={isEditModalOpen}
        closeModal={onCloseEditModal}
        title="Edit this todo"
      >
        <form onSubmit={submitHandler} className="space-y-3 ">
          <Input
            name="title"
            value={todoToEdit.title}
            onChange={onChangeHandler}
          />
          <Textarea
            name="description"
            value={todoToEdit.description}
            onChange={onChangeHandler}
          />
          <div className="flex items-center space-x-3 mt-4">
            <Button
              className="bg-indigo-700 hover:bg-indigo-800"
              isLoading={isUpdating}
            >
              Update
            </Button>
            <Button type="button" onClick={onCloseEditModal} variant={"cancel"}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {/* DELETE TODO CONFIRM MODAL */}
      <Modal
        isOpen={isOpenConfirmModal}
        closeModal={closeConfirmModal}
        title="Are you sure you want to remove this Todo from your Store?"
        description="Deleting this Todo will remove it permanently from your inventory. Any associated data, sales history, and other related information will also be deleted. Please make sure this is the intended action."
      >
        <div className="flex items-center space-x-3">
          <Button variant={"danger"} size={"sm"} onClick={onSubmitRemoveTodo}>
            Yes, remove
          </Button>
          <Button
            type="button"
            variant={"cancel"}
            size={"sm"}
            onClick={closeConfirmModal}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TodoList;
